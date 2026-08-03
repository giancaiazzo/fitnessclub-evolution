using FitnessClubEvolution.Api.Data;
using FitnessClubEvolution.Api.DTOs;
using FitnessClubEvolution.Api.Models;
using FitnessClubEvolution.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace FitnessClubEvolution.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ClientesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ClientesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/clientes
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<ClienteResponse>>> ObtenerClientes(
        CancellationToken cancellationToken)
    {
        var clientes = await _context.Clientes
            .AsNoTracking()
            .OrderBy(cliente => cliente.Apellido)
            .ThenBy(cliente => cliente.Nombre)
            .Select(ProyeccionCliente)
            .ToListAsync(cancellationToken);

        return Ok(clientes);
    }

    // GET: api/clientes/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClienteResponse>> ObtenerClientePorId(
        int id,
        CancellationToken cancellationToken)
    {
        var cliente = await _context.Clientes
            .AsNoTracking()
            .Where(cliente => cliente.IdCliente == id)
            .Select(ProyeccionCliente)
            .SingleOrDefaultAsync(cancellationToken);

        return cliente is null
            ? NotFound(new { message = "No se encontró el cliente solicitado." })
            : Ok(cliente);
    }

    // POST: api/clientes
    [HttpPost]
    public async Task<ActionResult<ClienteResponse>> CrearCliente(
        [FromBody] CrearClienteRequest request,
        CancellationToken cancellationToken)
    {
        if (request.FechaNacimiento is { } nacimiento && nacimiento > FechaGimnasio.Hoy())
        {
            return BadRequest(new { message = "La fecha de nacimiento no puede ser futura." });
        }

        var documento = request.Documento.Trim();
        var documentoExistente = await _context.Clientes.AnyAsync(
            cliente => cliente.Documento == documento,
            cancellationToken);

        if (documentoExistente)
        {
            return Conflict(new { message = "Ya existe un cliente registrado con ese documento." });
        }

        var cliente = new Cliente
        {
            Nombre = request.Nombre.Trim(),
            Apellido = request.Apellido.Trim(),
            Documento = documento,
            Telefono = request.Telefono.Trim(),
            FechaNacimiento = request.FechaNacimiento,
            Direccion = LimpiarTextoOpcional(request.Direccion),
            FechaRegistro = DateTime.UtcNow,
            Estado = true
        };

        _context.Clientes.Add(cliente);
        await _context.SaveChangesAsync(cancellationToken);

        // La rutina queda validada y disponible en request.RutinaSeleccionada.
        // El PDF se asociará cuando se implemente el envío por WhatsApp.
        var respuesta = MapearCliente(cliente);
        return CreatedAtAction(nameof(ObtenerClientePorId), new { id = cliente.IdCliente }, respuesta);
    }

    // PUT: api/clientes/5
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ClienteResponse>> ActualizarCliente(
        int id,
        [FromBody] ActualizarClienteRequest request,
        CancellationToken cancellationToken)
    {
        var cliente = await _context.Clientes.SingleOrDefaultAsync(
            cliente => cliente.IdCliente == id,
            cancellationToken);

        if (cliente is null)
        {
            return NotFound(new { message = "No se encontró el cliente solicitado." });
        }

        if (request.FechaNacimiento is { } nacimiento && nacimiento > FechaGimnasio.Hoy())
        {
            return BadRequest(new { message = "La fecha de nacimiento no puede ser futura." });
        }

        var documento = request.Documento.Trim();
        var documentoEnUso = await _context.Clientes.AnyAsync(
            otro => otro.IdCliente != id && otro.Documento == documento,
            cancellationToken);

        if (documentoEnUso)
        {
            return Conflict(new { message = "Ya existe otro cliente registrado con ese documento." });
        }

        cliente.Nombre = request.Nombre.Trim();
        cliente.Apellido = request.Apellido.Trim();
        cliente.Documento = documento;
        cliente.Telefono = request.Telefono.Trim();
        cliente.FechaNacimiento = request.FechaNacimiento;
        cliente.Direccion = LimpiarTextoOpcional(request.Direccion);
        cliente.Estado = request.Estado!.Value;

        await _context.SaveChangesAsync(cancellationToken);
        return Ok(MapearCliente(cliente));
    }

    // DELETE: api/clientes/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> EliminarCliente(
        int id,
        CancellationToken cancellationToken)
    {
        var cliente = await _context.Clientes.SingleOrDefaultAsync(
            cliente => cliente.IdCliente == id,
            cancellationToken);

        if (cliente is null)
        {
            return NotFound(new { message = "No se encontró el cliente solicitado." });
        }

        var tienePagos = await _context.Cuotas.AnyAsync(
            cuota => cuota.IdCliente == id,
            cancellationToken);

        if (tienePagos)
        {
            return Conflict(new
            {
                message = "El cliente tiene pagos registrados. Para conservar el historial, marcá su estado como inactivo en lugar de eliminarlo."
            });
        }

        _context.Clientes.Remove(cliente);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    // GET: api/clientes/buscar?texto=ana
    [HttpGet("buscar")]
    public async Task<ActionResult<IReadOnlyCollection<ClienteResponse>>> BuscarClientes(
        [FromQuery] string texto,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(texto))
        {
            return BadRequest(new { message = "Ingresá un nombre, apellido, documento o teléfono." });
        }

        var termino = texto.Trim();
        var patron = $"%{termino}%";
        var coincideConId = int.TryParse(termino, out var idBuscado);

        var clientes = await _context.Clientes
            .AsNoTracking()
            .Where(cliente =>
                (coincideConId && cliente.IdCliente == idBuscado) ||
                EF.Functions.ILike(cliente.Nombre, patron) ||
                EF.Functions.ILike(cliente.Apellido, patron) ||
                EF.Functions.ILike(cliente.Documento, patron) ||
                EF.Functions.ILike(cliente.Telefono, patron))
            .OrderByDescending(cliente => cliente.Estado)
            .ThenBy(cliente => cliente.Apellido)
            .ThenBy(cliente => cliente.Nombre)
            .Take(20)
            .Select(ProyeccionCliente)
            .ToListAsync(cancellationToken);

        return Ok(clientes);
    }

    // PATCH: api/clientes/5/estado
    [HttpPatch("{id:int}/estado")]
    public async Task<ActionResult<ClienteResponse>> CambiarEstadoCliente(
        int id,
        [FromBody] CambiarEstadoClienteRequest request,
        CancellationToken cancellationToken)
    {
        var cliente = await _context.Clientes.SingleOrDefaultAsync(
            cliente => cliente.IdCliente == id,
            cancellationToken);

        if (cliente is null)
        {
            return NotFound(new { message = "No se encontró el cliente solicitado." });
        }

        cliente.Estado = request.Estado!.Value;
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(MapearCliente(cliente));
    }

    // GET: api/clientes/5/detalle
    [HttpGet("{id:int}/detalle")]
    public async Task<ActionResult<ClienteDetalleResponse>> ObtenerDetalleCliente(
        int id,
        CancellationToken cancellationToken)
    {
        var cliente = await _context.Clientes
            .AsNoTracking()
            .SingleOrDefaultAsync(cliente => cliente.IdCliente == id, cancellationToken);

        if (cliente is null)
        {
            return NotFound(new { message = "No se encontró el cliente solicitado." });
        }

        return Ok(new ClienteDetalleResponse
        {
            IdCliente = cliente.IdCliente,
            Nombre = cliente.Nombre,
            Apellido = cliente.Apellido,
            Documento = cliente.Documento,
            Telefono = cliente.Telefono,
            FechaNacimiento = cliente.FechaNacimiento,
            Direccion = cliente.Direccion,
            FechaRegistro = cliente.FechaRegistro,
            Estado = cliente.Estado,
            Edad = CalcularEdad(cliente.FechaNacimiento)
        });
    }

    // GET: api/clientes/5/estado-pago
    [HttpGet("{id:int}/estado-pago")]
    public async Task<ActionResult<EstadoPagoClienteResponse>> ObtenerEstadoPago(
        int id,
        CancellationToken cancellationToken)
    {
        var cliente = await _context.Clientes
            .AsNoTracking()
            .SingleOrDefaultAsync(cliente => cliente.IdCliente == id, cancellationToken);

        if (cliente is null)
        {
            return NotFound(new { message = "No se encontró el cliente solicitado." });
        }

        var ultimaCuota = await _context.Cuotas
            .AsNoTracking()
            .Where(cuota => cuota.IdCliente == id && cuota.EstadoPago == "Confirmado")
            .OrderByDescending(cuota => cuota.FechaVencimiento)
            .ThenByDescending(cuota => cuota.FechaPago)
            .Select(cuota => new
            {
                cuota.FechaPago,
                cuota.FechaInicio,
                cuota.FechaVencimiento,
                Servicio = cuota.Servicio.Nombre
            })
            .FirstOrDefaultAsync(cancellationToken);

        return Ok(CrearEstadoPago(cliente, ultimaCuota?.FechaPago, ultimaCuota?.FechaInicio,
            ultimaCuota?.FechaVencimiento, ultimaCuota?.Servicio));
    }

    private static ClienteResponse MapearCliente(Cliente cliente)
    {
        return new ClienteResponse
        {
            IdCliente = cliente.IdCliente,
            Nombre = cliente.Nombre,
            Apellido = cliente.Apellido,
            Documento = cliente.Documento,
            Telefono = cliente.Telefono,
            FechaNacimiento = cliente.FechaNacimiento,
            Direccion = cliente.Direccion,
            FechaRegistro = cliente.FechaRegistro,
            Estado = cliente.Estado
        };
    }

    private static readonly Expression<Func<Cliente, ClienteResponse>> ProyeccionCliente =
        cliente => new ClienteResponse
        {
            IdCliente = cliente.IdCliente,
            Nombre = cliente.Nombre,
            Apellido = cliente.Apellido,
            Documento = cliente.Documento,
            Telefono = cliente.Telefono,
            FechaNacimiento = cliente.FechaNacimiento,
            Direccion = cliente.Direccion,
            FechaRegistro = cliente.FechaRegistro,
            Estado = cliente.Estado
        };

    private static EstadoPagoClienteResponse CrearEstadoPago(
        Cliente cliente,
        DateTime? fechaPago,
        DateOnly? fechaInicio,
        DateOnly? fechaVencimiento,
        string? servicio)
    {
        var respuesta = new EstadoPagoClienteResponse
        {
            IdCliente = cliente.IdCliente,
            Nombre = cliente.Nombre,
            Apellido = cliente.Apellido,
            Documento = cliente.Documento,
            ClienteActivo = cliente.Estado,
            UltimaFechaPago = fechaPago,
            FechaInicio = fechaInicio,
            FechaVencimiento = fechaVencimiento,
            Servicio = servicio
        };

        if (fechaVencimiento is null)
        {
            return respuesta;
        }

        var diferencia = fechaVencimiento.Value.DayNumber - FechaGimnasio.Hoy().DayNumber;
        respuesta.DiasRestantes = Math.Max(0, diferencia);
        respuesta.DiasVencido = diferencia < 0 ? Math.Abs(diferencia) : 0;
        respuesta.EstadoCuota = diferencia switch
        {
            < 0 => "Vencida",
            0 => "Vence hoy",
            <= 5 => "Por vencer",
            _ => "Vigente"
        };

        return respuesta;
    }

    private static int? CalcularEdad(DateOnly? nacimiento)
    {
        if (nacimiento is null)
        {
            return null;
        }

        var hoy = FechaGimnasio.Hoy();
        var edad = hoy.Year - nacimiento.Value.Year;
        if (nacimiento.Value.AddYears(edad) > hoy)
        {
            edad--;
        }

        return Math.Max(0, edad);
    }

    private static string? LimpiarTextoOpcional(string? valor)
    {
        return string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
    }
}
