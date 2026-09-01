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
    private readonly IN8nWebhookClient _n8nWebhookClient;

    public ClientesController(
        AppDbContext context,
        IN8nWebhookClient n8nWebhookClient)
    {
        _context = context;
        _n8nWebhookClient = n8nWebhookClient;
    }

    /// <summary>
    /// MÓDULO 2: consulta todos los clientes sin seguimiento de EF, ordenados
    /// alfabéticamente, y proyecta solamente los campos requeridos por el listado.
    /// </summary>
    /// <returns>HTTP 200 con una colección de clientes; puede estar vacía.</returns>
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

    /// <summary>
    /// MÓDULOS 2 Y 3: consulta la última cuota confirmada de cada cliente y
    /// calcula vigente, por vencer o vencida con la fecha local del gimnasio.
    /// </summary>
    /// <returns>HTTP 200 con el resumen que usa Gestión y que origina recordatorios.</returns>
    // GET: api/clientes/estado-pagos
    [HttpGet("estado-pagos")]
    public async Task<ActionResult<IReadOnlyCollection<ClientePagoResumenResponse>>> ObtenerEstadoPagosClientes(
        CancellationToken cancellationToken)
    {
        var clientes = await _context.Clientes
            .AsNoTracking()
            .OrderBy(cliente => cliente.Apellido)
            .ThenBy(cliente => cliente.Nombre)
            .Select(cliente => new
            {
                cliente.IdCliente,
                cliente.Nombre,
                cliente.Apellido,
                cliente.Documento,
                cliente.Telefono,
                cliente.FechaRegistro,
                ClienteActivo = cliente.Estado,
                UltimaFechaPago = cliente.Cuotas
                    .Where(cuota => cuota.EstadoPago == "Confirmado")
                    .OrderByDescending(cuota => cuota.FechaVencimiento)
                    .ThenByDescending(cuota => cuota.FechaPago)
                    .Select(cuota => (DateTime?)cuota.FechaPago)
                    .FirstOrDefault(),
                FechaInicio = cliente.Cuotas
                    .Where(cuota => cuota.EstadoPago == "Confirmado")
                    .OrderByDescending(cuota => cuota.FechaVencimiento)
                    .ThenByDescending(cuota => cuota.FechaPago)
                    .Select(cuota => (DateOnly?)cuota.FechaInicio)
                    .FirstOrDefault(),
                FechaVencimiento = cliente.Cuotas
                    .Where(cuota => cuota.EstadoPago == "Confirmado")
                    .OrderByDescending(cuota => cuota.FechaVencimiento)
                    .ThenByDescending(cuota => cuota.FechaPago)
                    .Select(cuota => (DateOnly?)cuota.FechaVencimiento)
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        var hoy = FechaGimnasio.Hoy();
        var respuesta = clientes.Select(cliente =>
        {
            var esCuotaInicial = cliente.UltimaFechaPago is null;
            var inicioCuotaInicial = FechaGimnasio.DesdeUtc(cliente.FechaRegistro);
            var fechaInicio = cliente.FechaInicio ?? inicioCuotaInicial;
            var fechaVencimiento = cliente.FechaVencimiento ?? inicioCuotaInicial.AddMonths(1);
            var diferencia = fechaVencimiento.DayNumber - hoy.DayNumber;

            return new ClientePagoResumenResponse
            {
                IdCliente = cliente.IdCliente,
                Nombre = cliente.Nombre,
                Apellido = cliente.Apellido,
                Documento = cliente.Documento,
                Telefono = cliente.Telefono,
                FechaRegistro = cliente.FechaRegistro,
                ClienteActivo = cliente.ClienteActivo,
                UltimaFechaPago = cliente.UltimaFechaPago ?? cliente.FechaRegistro,
                FechaInicio = fechaInicio,
                FechaVencimiento = fechaVencimiento,
                DiasRestantes = Math.Max(0, diferencia),
                DiasVencido = diferencia < 0 ? Math.Abs(diferencia) : 0,
                EstadoCuota = diferencia switch
                {
                    < 0 => "Vencida",
                    0 => "Vence hoy",
                    <= 5 => "Por vencer",
                    _ => "Vigente"
                },
                EsCuotaInicial = esCuotaInicial,
                PagaEstaSemana = cliente.ClienteActivo && diferencia is >= 0 and <= 7
            };
        }).ToList();

        return Ok(respuesta);
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

    /// <summary>
    /// MÓDULOS 2 Y 3: valida fecha, rutina y documento duplicado, crea el cliente
    /// y, si aceptó WhatsApp, genera en el outbox el envío inicial de su rutina.
    /// </summary>
    /// <returns>HTTP 201 con el cliente creado, 409 por documento repetido o 400 por datos inválidos.</returns>
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

        var rutina = await _context.Rutinas.SingleOrDefaultAsync(
            rutina => rutina.IdRutina == request.IdRutina,
            cancellationToken);

        if (rutina is null)
        {
            return BadRequest(new { message = "La rutina seleccionada no existe." });
        }

        var documento = request.Documento.Trim();
        var documentoExistente = await _context.Clientes.AnyAsync(
            cliente => cliente.Documento == documento,
            cancellationToken);

        if (documentoExistente)
        {
            return Conflict(new { message = "Ya existe un cliente registrado con ese documento." });
        }

        var ahora = DateTime.UtcNow;
        var cliente = new Cliente
        {
            Nombre = request.Nombre.Trim(),
            Apellido = request.Apellido.Trim(),
            Documento = documento,
            Telefono = request.Telefono.Trim(),
            FechaNacimiento = request.FechaNacimiento,
            Direccion = LimpiarTextoOpcional(request.Direccion),
            FechaRegistro = ahora,
            Estado = true,
            AceptaWhatsApp = request.AceptaWhatsApp,
            FechaConsentimientoWhatsApp = request.AceptaWhatsApp ? ahora : null,
            FechaBajaWhatsApp = null,
            IdRutina = rutina.IdRutina,
            Rutina = rutina
        };

        await using var transaccion = await _context.Database
            .BeginTransactionAsync(cancellationToken);
        Notificacion? notificacionRutina = null;

        _context.Clientes.Add(cliente);
        await _context.SaveChangesAsync(cancellationToken);

        if (cliente.AceptaWhatsApp)
        {
            notificacionRutina = CrearNotificacionRutina(
                cliente,
                rutina,
                $"rutina:{cliente.IdCliente}:{rutina.IdRutina}:alta");
            _context.Notificaciones.Add(notificacionRutina);
            await _context.SaveChangesAsync(cancellationToken);
        }

        await transaccion.CommitAsync(cancellationToken);
        await DespertarEnvioRutina(notificacionRutina, cliente);

        var respuesta = MapearCliente(cliente);
        return CreatedAtAction(nameof(ObtenerClientePorId), new { id = cliente.IdCliente }, respuesta);
    }

    /// <summary>
    /// MÓDULOS 2 Y 3: actualiza la ficha y el consentimiento; cuando cambia la
    /// rutina crea un nuevo evento idempotente para que n8n envíe el PDF correcto.
    /// </summary>
    /// <returns>HTTP 200 con la ficha actualizada o errores 404/409/400.</returns>
    // PUT: api/clientes/5
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ClienteResponse>> ActualizarCliente(
        int id,
        [FromBody] ActualizarClienteRequest request,
        CancellationToken cancellationToken)
    {
        var cliente = await _context.Clientes
            .Include(cliente => cliente.Rutina)
            .SingleOrDefaultAsync(
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

        var rutina = await _context.Rutinas.SingleOrDefaultAsync(
            rutina => rutina.IdRutina == request.IdRutina,
            cancellationToken);

        if (rutina is null)
        {
            return BadRequest(new { message = "La rutina seleccionada no existe." });
        }

        var documento = request.Documento.Trim();
        var documentoEnUso = await _context.Clientes.AnyAsync(
            otro => otro.IdCliente != id && otro.Documento == documento,
            cancellationToken);

        if (documentoEnUso)
        {
            return Conflict(new { message = "Ya existe otro cliente registrado con ese documento." });
        }

        var rutinaAnterior = cliente.IdRutina;
        var aceptabaWhatsApp = cliente.AceptaWhatsApp;
        var consentimientoActivado = request.AceptaWhatsApp == true && !aceptabaWhatsApp;
        var ahora = DateTime.UtcNow;

        cliente.Nombre = request.Nombre.Trim();
        cliente.Apellido = request.Apellido.Trim();
        cliente.Documento = documento;
        cliente.Telefono = request.Telefono.Trim();
        cliente.FechaNacimiento = request.FechaNacimiento;
        cliente.Direccion = LimpiarTextoOpcional(request.Direccion);
        cliente.Estado = request.Estado!.Value;
        if (request.AceptaWhatsApp is { } aceptaWhatsApp)
        {
            cliente.AceptaWhatsApp = aceptaWhatsApp;
            if (aceptaWhatsApp && !aceptabaWhatsApp)
            {
                cliente.FechaConsentimientoWhatsApp = ahora;
                cliente.FechaBajaWhatsApp = null;
            }
            else if (!aceptaWhatsApp && aceptabaWhatsApp)
            {
                cliente.FechaBajaWhatsApp = ahora;
            }
        }

        cliente.IdRutina = rutina.IdRutina;
        cliente.Rutina = rutina;

        Notificacion? notificacionRutina = null;
        if ((rutinaAnterior != rutina.IdRutina || consentimientoActivado) &&
            cliente.AceptaWhatsApp)
        {
            notificacionRutina = CrearNotificacionRutina(
                cliente,
                rutina,
                $"rutina:{cliente.IdCliente}:{rutina.IdRutina}:{ahora:yyyyMMddHHmmssfff}");
            _context.Notificaciones.Add(notificacionRutina);
        }

        await _context.SaveChangesAsync(cancellationToken);
        await DespertarEnvioRutina(notificacionRutina, cliente);
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
                EF.Functions.ILike(cliente.Telefono, patron) ||
                EF.Functions.ILike(cliente.Rutina.Nombre, patron))
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
        var cliente = await _context.Clientes
            .Include(cliente => cliente.Rutina)
            .SingleOrDefaultAsync(
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
            .Include(cliente => cliente.Rutina)
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
            IdRutina = cliente.IdRutina,
            RutinaNombre = cliente.Rutina.Nombre,
            AceptaWhatsApp = cliente.AceptaWhatsApp,
            FechaConsentimientoWhatsApp = cliente.FechaConsentimientoWhatsApp,
            FechaBajaWhatsApp = cliente.FechaBajaWhatsApp,
            Edad = CalcularEdad(cliente.FechaNacimiento)
        });
    }

    /// <summary>
    /// MÓDULO 2: consulta la última cuota confirmada de un cliente y devuelve
    /// fechas, días restantes/vencidos y si todavía usa la cuota inicial.
    /// </summary>
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
                cuota.FechaVencimiento
            })
            .FirstOrDefaultAsync(cancellationToken);

        return Ok(CrearEstadoPago(cliente, ultimaCuota?.FechaPago, ultimaCuota?.FechaInicio,
            ultimaCuota?.FechaVencimiento));
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
            Estado = cliente.Estado,
            IdRutina = cliente.IdRutina,
            RutinaNombre = cliente.Rutina.Nombre,
            AceptaWhatsApp = cliente.AceptaWhatsApp,
            FechaConsentimientoWhatsApp = cliente.FechaConsentimientoWhatsApp,
            FechaBajaWhatsApp = cliente.FechaBajaWhatsApp
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
            Estado = cliente.Estado,
            IdRutina = cliente.IdRutina,
            RutinaNombre = cliente.Rutina.Nombre,
            AceptaWhatsApp = cliente.AceptaWhatsApp,
            FechaConsentimientoWhatsApp = cliente.FechaConsentimientoWhatsApp,
            FechaBajaWhatsApp = cliente.FechaBajaWhatsApp
        };

    private static Notificacion CrearNotificacionRutina(
        Cliente cliente,
        Rutina rutina,
        string claveIdempotencia)
    {
        var ahora = DateTime.UtcNow;
        return new Notificacion
        {
            IdCliente = cliente.IdCliente,
            Cliente = cliente,
            Tipo = "RutinaAsignada",
            Mensaje = "Rutina asignada pendiente de envío por WhatsApp.",
            FechaProgramada = ahora,
            Estado = "Pendiente",
            Canal = "WhatsApp",
            Referencia = rutina.IdRutina.ToString(),
            ClaveIdempotencia = claveIdempotencia,
            FechaCreacion = ahora
        };
    }

    private async Task DespertarEnvioRutina(
        Notificacion? notificacion,
        Cliente cliente)
    {
        if (notificacion is null)
        {
            return;
        }

        await _n8nWebhookClient.NotificarRutinaAsignada(
            new RutinaAsignadaWebhook(
                notificacion.IdNotificacion,
                cliente.IdCliente,
                cliente.Telefono,
                $"{cliente.Nombre} {cliente.Apellido}".Trim(),
                notificacion.Referencia ?? cliente.IdRutina.ToString()),
            CancellationToken.None);
    }

    private static EstadoPagoClienteResponse CrearEstadoPago(
        Cliente cliente,
        DateTime? fechaPago,
        DateOnly? fechaInicio,
        DateOnly? fechaVencimiento)
    {
        var esCuotaInicial = fechaPago is null;
        var inicioCuotaInicial = FechaGimnasio.DesdeUtc(cliente.FechaRegistro);
        var fechaInicioEfectiva = fechaInicio ?? inicioCuotaInicial;
        var fechaVencimientoEfectiva = fechaVencimiento ?? inicioCuotaInicial.AddMonths(1);
        var respuesta = new EstadoPagoClienteResponse
        {
            IdCliente = cliente.IdCliente,
            Nombre = cliente.Nombre,
            Apellido = cliente.Apellido,
            Documento = cliente.Documento,
            ClienteActivo = cliente.Estado,
            UltimaFechaPago = fechaPago ?? cliente.FechaRegistro,
            FechaInicio = fechaInicioEfectiva,
            FechaVencimiento = fechaVencimientoEfectiva,
            EsCuotaInicial = esCuotaInicial
        };

        var diferencia = fechaVencimientoEfectiva.DayNumber - FechaGimnasio.Hoy().DayNumber;
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
