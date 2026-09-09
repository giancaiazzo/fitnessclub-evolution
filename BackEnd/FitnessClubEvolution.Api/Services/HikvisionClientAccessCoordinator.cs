using FitnessClubEvolution.Api.Data;
using FitnessClubEvolution.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FitnessClubEvolution.Api.Services;

public interface IHikvisionClientAccessCoordinator
{
    Task<HikvisionClientSyncResult> SincronizarCliente(
        Cliente cliente,
        DateOnly? fechaVencimiento,
        CancellationToken cancellationToken);

    Task<HikvisionClientSyncResult> DeshabilitarCodigoActual(
        Cliente cliente,
        CancellationToken cancellationToken);

    Task<HikvisionReconciliationResult> Reconciliar(
        CancellationToken cancellationToken);
}

/// <summary>
/// Traduce el estado comercial del cliente a la vigencia física del equipo y
/// guarda el resultado. Una falla externa se audita, pero nunca revierte un
/// alta, una modificación o un pago ya confirmado en PostgreSQL.
/// </summary>
public sealed class HikvisionClientAccessCoordinator : IHikvisionClientAccessCoordinator
{
    private const string PagoConfirmado = "Confirmado";
    private readonly AppDbContext _context;
    private readonly IHikvisionAccessService _hikvision;
    private readonly ILogger<HikvisionClientAccessCoordinator> _logger;

    public HikvisionClientAccessCoordinator(
        AppDbContext context,
        IHikvisionAccessService hikvision,
        ILogger<HikvisionClientAccessCoordinator> logger)
    {
        _context = context;
        _hikvision = hikvision;
        _logger = logger;
    }

    public async Task<HikvisionClientSyncResult> SincronizarCliente(
        Cliente cliente,
        DateOnly? fechaVencimiento,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(cliente.HikvisionEmployeeNo))
        {
            return HikvisionClientSyncResult.NotLinked(cliente.IdCliente);
        }

        try
        {
            var expiration = fechaVencimiento ??
                await ObtenerVencimientoEfectivo(cliente, cancellationToken);
            var enabled = cliente.Estado && expiration >= FechaGimnasio.Hoy();
            var result = await _hikvision.SincronizarAcceso(
                cliente.HikvisionEmployeeNo,
                enabled,
                expiration,
                cancellationToken);

            cliente.FechaUltimaSincronizacionHikvision = DateTime.UtcNow;
            if (result.Success)
            {
                cliente.AccesoHikvisionHabilitado = result.Enabled;
                cliente.FechaVencimientoAccesoHikvision = result.ExpirationDate;
                cliente.UltimoErrorHikvision = null;
            }
            else
            {
                cliente.UltimoErrorHikvision = Limit(result.Error, 1000);
            }

            await TrySaveAudit(cancellationToken);
            return new HikvisionClientSyncResult(
                cliente.IdCliente,
                true,
                result.Success,
                result.Enabled,
                result.ExpirationDate,
                result.Error);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(
                exception,
                "No se pudo coordinar el acceso Hikvision del cliente {IdCliente}.",
                cliente.IdCliente);
            return new HikvisionClientSyncResult(
                cliente.IdCliente,
                true,
                false,
                false,
                fechaVencimiento,
                "No se pudo completar la sincronización con Hikvision.");
        }
    }

    public async Task<HikvisionClientSyncResult> DeshabilitarCodigoActual(
        Cliente cliente,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(cliente.HikvisionEmployeeNo))
        {
            return HikvisionClientSyncResult.NotLinked(cliente.IdCliente);
        }

        try
        {
            var expiration = await ObtenerVencimientoEfectivo(cliente, cancellationToken);
            var result = await _hikvision.SincronizarAcceso(
                cliente.HikvisionEmployeeNo,
                false,
                expiration,
                cancellationToken);
            return new HikvisionClientSyncResult(
                cliente.IdCliente,
                true,
                result.Success,
                false,
                expiration,
                result.Error);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(
                exception,
                "No se pudo deshabilitar el código Hikvision del cliente {IdCliente}.",
                cliente.IdCliente);
            return new HikvisionClientSyncResult(
                cliente.IdCliente,
                true,
                false,
                false,
                null,
                "No se pudo deshabilitar el código anterior en Hikvision.");
        }
    }

    public async Task<HikvisionReconciliationResult> Reconciliar(
        CancellationToken cancellationToken)
    {
        var clientes = await _context.Clientes
            .Where(cliente => cliente.HikvisionEmployeeNo != null)
            .OrderBy(cliente => cliente.IdCliente)
            .ToListAsync(cancellationToken);

        if (clientes.Count == 0)
        {
            return new HikvisionReconciliationResult(
                0,
                0,
                0,
                Array.Empty<HikvisionClientSyncResult>());
        }

        // Si el controlador completo está fuera de línea, no se esperan diez
        // segundos por cada cliente. Se registra un único diagnóstico y el
        // próximo ciclo diario vuelve a probar.
        var device = await _hikvision.ProbarConexion(cancellationToken);
        if (!device.Success)
        {
            var timestamp = DateTime.UtcNow;
            var error = Limit(device.Error, 1000) ?? "Hikvision no está disponible.";
            foreach (var cliente in clientes)
            {
                cliente.FechaUltimaSincronizacionHikvision = timestamp;
                cliente.UltimoErrorHikvision = error;
            }

            await TrySaveAudit(cancellationToken);
            var failedDetails = clientes.Select(cliente => new HikvisionClientSyncResult(
                cliente.IdCliente,
                true,
                false,
                false,
                null,
                error)).ToList();
            return new HikvisionReconciliationResult(
                clientes.Count,
                0,
                clientes.Count,
                failedDetails);
        }

        var successes = 0;
        var failures = 0;
        var details = new List<HikvisionClientSyncResult>(clientes.Count);

        foreach (var cliente in clientes)
        {
            var result = await SincronizarCliente(cliente, null, cancellationToken);
            details.Add(result);
            if (result.Success)
            {
                successes++;
            }
            else
            {
                failures++;
            }
        }

        return new HikvisionReconciliationResult(
            clientes.Count,
            successes,
            failures,
            details);
    }

    private async Task<DateOnly> ObtenerVencimientoEfectivo(
        Cliente cliente,
        CancellationToken cancellationToken)
    {
        var latestExpiration = await _context.Cuotas
            .AsNoTracking()
            .Where(cuota =>
                cuota.IdCliente == cliente.IdCliente &&
                cuota.EstadoPago == PagoConfirmado)
            .MaxAsync(cuota => (DateOnly?)cuota.FechaVencimiento, cancellationToken);

        return latestExpiration ??
            FechaGimnasio.DesdeUtc(cliente.FechaRegistro).AddMonths(1);
    }

    private async Task TrySaveAudit(CancellationToken cancellationToken)
    {
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(exception, "No se pudo guardar la auditoría Hikvision.");
        }
    }

    private static string? Limit(string? value, int length) =>
        value is null || value.Length <= length ? value : value[..length];
}

public sealed record HikvisionClientSyncResult(
    int IdCliente,
    bool Linked,
    bool Success,
    bool Enabled,
    DateOnly? ExpirationDate,
    string? Error)
{
    public static HikvisionClientSyncResult NotLinked(int idCliente) =>
        new(idCliente, false, true, false, null, null);
}

public sealed record HikvisionReconciliationResult(
    int Total,
    int Successful,
    int Failed,
    IReadOnlyCollection<HikvisionClientSyncResult> Details);
