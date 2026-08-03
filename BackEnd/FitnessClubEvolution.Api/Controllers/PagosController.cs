using FitnessClubEvolution.Api.Data;
using FitnessClubEvolution.Api.DTOs;
using FitnessClubEvolution.Api.Models;
using FitnessClubEvolution.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitnessClubEvolution.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PagosController : ControllerBase
{
    private const string PagoConfirmado = "Confirmado";
    private readonly AppDbContext _context;

    public PagosController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/pagos/12
    [HttpGet("{id:int}")]
    public async Task<ActionResult<PagoResponse>> ObtenerPagoPorId(
        int id,
        CancellationToken cancellationToken)
    {
        var pago = await _context.Cuotas
            .AsNoTracking()
            .Where(cuota => cuota.IdCuota == id)
            .Select(cuota => new PagoResponse
            {
                IdCuota = cuota.IdCuota,
                IdCliente = cuota.IdCliente,
                Cliente = cuota.Cliente.Nombre + " " + cuota.Cliente.Apellido,
                IdServicio = cuota.IdServicio,
                Servicio = cuota.Servicio.Nombre,
                IdEntrenador = cuota.IdEntrenador,
                Entrenador = cuota.Entrenador == null
                    ? null
                    : cuota.Entrenador.Nombre + " " + cuota.Entrenador.Apellido,
                FechaPago = cuota.FechaPago,
                FechaInicio = cuota.FechaInicio,
                FechaVencimiento = cuota.FechaVencimiento,
                Monto = cuota.Monto,
                MetodoPago = cuota.MetodoPago,
                EstadoPago = cuota.EstadoPago,
                Observaciones = cuota.Observaciones
            })
            .SingleOrDefaultAsync(cancellationToken);

        return pago is null
            ? NotFound(new { message = "No se encontró el pago solicitado." })
            : Ok(pago);
    }

    // GET: api/pagos/cliente/5
    [HttpGet("cliente/{idCliente:int}")]
    public async Task<ActionResult<IReadOnlyCollection<PagoResponse>>> ObtenerHistorialCliente(
        int idCliente,
        CancellationToken cancellationToken)
    {
        var clienteExiste = await _context.Clientes
            .AsNoTracking()
            .AnyAsync(cliente => cliente.IdCliente == idCliente, cancellationToken);

        if (!clienteExiste)
        {
            return NotFound(new { message = "No se encontró el cliente solicitado." });
        }

        var pagos = await _context.Cuotas
            .AsNoTracking()
            .Where(cuota => cuota.IdCliente == idCliente)
            .OrderByDescending(cuota => cuota.FechaPago)
            .ThenByDescending(cuota => cuota.IdCuota)
            .Select(cuota => new PagoResponse
            {
                IdCuota = cuota.IdCuota,
                IdCliente = cuota.IdCliente,
                Cliente = cuota.Cliente.Nombre + " " + cuota.Cliente.Apellido,
                IdServicio = cuota.IdServicio,
                Servicio = cuota.Servicio.Nombre,
                IdEntrenador = cuota.IdEntrenador,
                Entrenador = cuota.Entrenador == null
                    ? null
                    : cuota.Entrenador.Nombre + " " + cuota.Entrenador.Apellido,
                FechaPago = cuota.FechaPago,
                FechaInicio = cuota.FechaInicio,
                FechaVencimiento = cuota.FechaVencimiento,
                Monto = cuota.Monto,
                MetodoPago = cuota.MetodoPago,
                EstadoPago = cuota.EstadoPago,
                Observaciones = cuota.Observaciones
            })
            .ToListAsync(cancellationToken);

        return Ok(pagos);
    }

    // POST: api/pagos
    [HttpPost]
    public async Task<ActionResult<RegistrarPagoResponse>> RegistrarPago(
        [FromBody] RegistrarPagoRequest request,
        CancellationToken cancellationToken)
    {
        var cliente = await _context.Clientes.SingleOrDefaultAsync(
            cliente => cliente.IdCliente == request.IdCliente,
            cancellationToken);

        if (cliente is null)
        {
            return NotFound(new { message = "No se encontró el cliente seleccionado." });
        }

        if (!cliente.Estado)
        {
            return Conflict(new { message = "El cliente está inactivo. Reactivalo antes de registrar un pago." });
        }

        var servicio = await _context.Servicios
            .AsNoTracking()
            .SingleOrDefaultAsync(
                servicio => servicio.IdServicio == request.IdServicio,
                cancellationToken);

        if (servicio is null)
        {
            return NotFound(new { message = "No se encontró el servicio seleccionado." });
        }

        Entrenador? entrenador = null;
        if (request.IdEntrenador is { } idEntrenador)
        {
            entrenador = await _context.Entrenadores
                .AsNoTracking()
                .SingleOrDefaultAsync(
                    entrenador => entrenador.IdEntrenador == idEntrenador,
                    cancellationToken);

            if (entrenador is null)
            {
                return NotFound(new { message = "No se encontró el entrenador seleccionado." });
            }
        }

        var fechaPago = DateTime.UtcNow;
        var hoy = FechaGimnasio.Hoy(fechaPago);
        var ultimoVencimiento = await _context.Cuotas
            .AsNoTracking()
            .Where(cuota =>
                cuota.IdCliente == cliente.IdCliente &&
                cuota.EstadoPago == PagoConfirmado)
            .MaxAsync(cuota => (DateOnly?)cuota.FechaVencimiento, cancellationToken);

        // Si paga antes de vencer, el mes nuevo comienza desde su vencimiento
        // actual. De esta manera el cliente nunca pierde días ya abonados.
        var fechaInicio = ultimoVencimiento is { } vencimiento && vencimiento >= hoy
            ? vencimiento
            : hoy;
        var fechaVencimiento = fechaInicio.AddMonths(1);

        var cuota = new Cuota
        {
            IdCliente = cliente.IdCliente,
            IdServicio = servicio.IdServicio,
            IdEntrenador = entrenador?.IdEntrenador,
            FechaPago = fechaPago,
            FechaInicio = fechaInicio,
            FechaVencimiento = fechaVencimiento,
            Monto = request.Monto,
            MetodoPago = request.MetodoPago.Trim(),
            EstadoPago = PagoConfirmado,
            Observaciones = LimpiarTextoOpcional(request.Observaciones)
        };

        _context.Cuotas.Add(cuota);
        await _context.SaveChangesAsync(cancellationToken);

        var nombreCliente = $"{cliente.Nombre} {cliente.Apellido}";
        var nombreEntrenador = entrenador is null
            ? null
            : $"{entrenador.Nombre} {entrenador.Apellido}";
        var pago = new PagoResponse
        {
            IdCuota = cuota.IdCuota,
            IdCliente = cuota.IdCliente,
            Cliente = nombreCliente,
            IdServicio = cuota.IdServicio,
            Servicio = servicio.Nombre,
            IdEntrenador = cuota.IdEntrenador,
            Entrenador = nombreEntrenador,
            FechaPago = cuota.FechaPago,
            FechaInicio = cuota.FechaInicio,
            FechaVencimiento = cuota.FechaVencimiento,
            Monto = cuota.Monto,
            MetodoPago = cuota.MetodoPago,
            EstadoPago = cuota.EstadoPago,
            Observaciones = cuota.Observaciones
        };

        var estadoCliente = new EstadoPagoClienteResponse
        {
            IdCliente = cliente.IdCliente,
            Nombre = cliente.Nombre,
            Apellido = cliente.Apellido,
            Documento = cliente.Documento,
            ClienteActivo = cliente.Estado,
            UltimaFechaPago = cuota.FechaPago,
            FechaInicio = cuota.FechaInicio,
            FechaVencimiento = cuota.FechaVencimiento,
            DiasRestantes = cuota.FechaVencimiento.DayNumber - hoy.DayNumber,
            DiasVencido = 0,
            EstadoCuota = "Vigente",
            Servicio = servicio.Nombre
        };

        var respuesta = new RegistrarPagoResponse
        {
            Pago = pago,
            EstadoCliente = estadoCliente
        };

        return CreatedAtAction(nameof(ObtenerPagoPorId), new { id = cuota.IdCuota }, respuesta);
    }

    private static string? LimpiarTextoOpcional(string? valor)
    {
        return string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
    }
}
