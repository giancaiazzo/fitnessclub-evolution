using FitnessClubEvolution.Api.Data;
using FitnessClubEvolution.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FitnessClubEvolution.Api.Services;

public sealed class MorosidadAutomaticaOptions
{
    public const string SectionName = "Clientes:MorosidadAutomatica";

    public bool Enabled { get; set; }

    public int DiasGracia { get; set; } = 3;

    public int IntervaloMinutos { get; set; } = 60;
}

public interface IMorosidadAutomaticaService
{
    Task<MorosidadPreviewResult> Previsualizar(CancellationToken cancellationToken);

    Task<MorosidadProcessingResult> Procesar(CancellationToken cancellationToken);
}

/// <summary>
/// Mantiene el estado comercial de FitnessClubEvolution. No elimina clientes,
/// cuotas ni conversaciones y tampoco necesita comunicarse con Hikvision: el
/// controlador físico respeta por su cuenta el vencimiento ya programado.
/// </summary>
public sealed class MorosidadAutomaticaService : IMorosidadAutomaticaService
{
    private const string PagoConfirmado = "Confirmado";
    private readonly AppDbContext _context;
    private readonly MorosidadAutomaticaOptions _options;
    private readonly ILogger<MorosidadAutomaticaService> _logger;

    public MorosidadAutomaticaService(
        AppDbContext context,
        IOptions<MorosidadAutomaticaOptions> options,
        ILogger<MorosidadAutomaticaService> logger)
    {
        _context = context;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<MorosidadPreviewResult> Previsualizar(
        CancellationToken cancellationToken)
    {
        var hoy = FechaGimnasio.Hoy();
        var candidatos = await ObtenerCandidatos(hoy, cancellationToken);
        return new MorosidadPreviewResult(
            _options.Enabled,
            _options.DiasGracia,
            hoy,
            candidatos);
    }

    public async Task<MorosidadProcessingResult> Procesar(
        CancellationToken cancellationToken)
    {
        var ahora = DateTime.UtcNow;
        var hoy = FechaGimnasio.Hoy(ahora);
        var candidatos = await ObtenerCandidatos(hoy, cancellationToken);
        if (candidatos.Count == 0)
        {
            return new MorosidadProcessingResult(
                _options.Enabled,
                _options.DiasGracia,
                ahora,
                0,
                Array.Empty<ClienteInactivadoMora>());
        }

        var inactivados = new List<ClienteInactivadoMora>(candidatos.Count);
        await using var transaction = await _context.Database.BeginTransactionAsync(
            cancellationToken);

        foreach (var candidato in candidatos)
        {
            // El filtro Estado hace que dos ejecuciones simultáneas sean
            // idempotentes: solo una puede efectuar y auditar la transición.
            var actualizados = await _context.Clientes
                .Where(cliente =>
                    cliente.IdCliente == candidato.IdCliente &&
                    cliente.Estado)
                .ExecuteUpdateAsync(actualizacion => actualizacion
                    .SetProperty(cliente => cliente.Estado, false),
                    cancellationToken);

            if (actualizados != 1)
            {
                continue;
            }

            var claveAuditoria =
                $"mora:{candidato.IdCliente}:{candidato.FechaVencimiento:yyyyMMdd}";
            _context.Notificaciones.Add(new Notificacion
            {
                IdCliente = candidato.IdCliente,
                Tipo = "ClienteInactivadoMora",
                Mensaje = $"Cliente inactivado automáticamente tras {_options.DiasGracia} días de gracia sin pago.",
                FechaProgramada = ahora,
                FechaEnvio = ahora,
                Estado = "Aplicada",
                ClaveIdempotencia = claveAuditoria,
                Canal = "Sistema",
                Referencia = candidato.FechaVencimiento.ToString("yyyy-MM-dd"),
                Intentos = 1,
                FechaCreacion = ahora,
                FechaActualizacion = ahora
            });
            inactivados.Add(new ClienteInactivadoMora(
                candidato.IdCliente,
                candidato.NombreCliente,
                candidato.FechaVencimiento,
                candidato.DiasVencido));
        }

        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        if (inactivados.Count > 0)
        {
            _logger.LogInformation(
                "Se inactivaron automáticamente {Cantidad} clientes con {DiasGracia} días de gracia vencidos.",
                inactivados.Count,
                _options.DiasGracia);
        }

        return new MorosidadProcessingResult(
            _options.Enabled,
            _options.DiasGracia,
            ahora,
            candidatos.Count,
            inactivados);
    }

    private async Task<IReadOnlyCollection<ClienteMorosoCandidate>> ObtenerCandidatos(
        DateOnly hoy,
        CancellationToken cancellationToken)
    {
        var clientesActivos = await _context.Clientes
            .AsNoTracking()
            .Where(cliente => cliente.Estado)
            .Select(cliente => new
            {
                cliente.IdCliente,
                cliente.Nombre,
                cliente.Apellido,
                cliente.FechaRegistro,
                UltimaFechaVencimiento = cliente.Cuotas
                    .Where(cuota => cuota.EstadoPago == PagoConfirmado)
                    .OrderByDescending(cuota => cuota.FechaVencimiento)
                    .Select(cuota => (DateOnly?)cuota.FechaVencimiento)
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        return clientesActivos
            .Select(cliente =>
            {
                var vencimiento = cliente.UltimaFechaVencimiento ??
                    FechaGimnasio.DesdeUtc(cliente.FechaRegistro).AddMonths(1);
                return new ClienteMorosoCandidate(
                    cliente.IdCliente,
                    $"{cliente.Nombre} {cliente.Apellido}".Trim(),
                    vencimiento,
                    Math.Max(0, hoy.DayNumber - vencimiento.DayNumber));
            })
            .Where(cliente => cliente.DiasVencido >= _options.DiasGracia)
            .OrderByDescending(cliente => cliente.DiasVencido)
            .ThenBy(cliente => cliente.NombreCliente)
            .ToList();
    }
}

/// <summary>
/// Ejecuta la revisión dentro del backend, al arrancar y luego por intervalo.
/// La operación es local a PostgreSQL y continúa aunque Hikvision esté caído.
/// </summary>
public sealed class MorosidadAutomaticaWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IOptionsMonitor<MorosidadAutomaticaOptions> _options;
    private readonly ILogger<MorosidadAutomaticaWorker> _logger;

    public MorosidadAutomaticaWorker(
        IServiceScopeFactory scopeFactory,
        IOptionsMonitor<MorosidadAutomaticaOptions> options,
        ILogger<MorosidadAutomaticaWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _options = options;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var options = _options.CurrentValue;
            if (options.Enabled)
            {
                try
                {
                    await using var scope = _scopeFactory.CreateAsyncScope();
                    var service = scope.ServiceProvider
                        .GetRequiredService<IMorosidadAutomaticaService>();
                    await service.Procesar(stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception exception)
                {
                    _logger.LogError(
                        exception,
                        "Falló la revisión automática de clientes morosos; se reintentará en el próximo intervalo.");
                }
            }

            var intervalo = TimeSpan.FromMinutes(
                Math.Clamp(options.IntervaloMinutos, 15, 1440));
            try
            {
                await Task.Delay(intervalo, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }
}

public sealed record ClienteMorosoCandidate(
    int IdCliente,
    string NombreCliente,
    DateOnly FechaVencimiento,
    int DiasVencido);

public sealed record ClienteInactivadoMora(
    int IdCliente,
    string NombreCliente,
    DateOnly FechaVencimiento,
    int DiasVencido);

public sealed record MorosidadPreviewResult(
    bool AutomaticEnabled,
    int GraceDays,
    DateOnly Today,
    IReadOnlyCollection<ClienteMorosoCandidate> Candidates);

public sealed record MorosidadProcessingResult(
    bool AutomaticEnabled,
    int GraceDays,
    DateTime ExecutedAtUtc,
    int Candidates,
    IReadOnlyCollection<ClienteInactivadoMora> DeactivatedClients);
