using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using FitnessClubEvolution.Api.Data;
using FitnessClubEvolution.Api.DTOs;
using FitnessClubEvolution.Api.Models;
using FitnessClubEvolution.Api.Security;
using FitnessClubEvolution.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace FitnessClubEvolution.Api.Controllers;

/// <summary>
/// API privada del módulo 3. n8n consulta este controlador en lugar de leer
/// PostgreSQL directamente, de modo que identificación, permisos, cuotas,
/// rutinas, consentimiento e idempotencia permanezcan bajo reglas del backend.
/// </summary>
[AllowAnonymous]
[N8nApiKey]
[ApiController]
[Route("api/integraciones/n8n")]
public class IntegracionesN8nController : ControllerBase
{
    private const string PagoConfirmado = "Confirmado";
    private readonly AppDbContext _context;
    private readonly IHikvisionAccessService _hikvision;
    private readonly IHikvisionClientAccessCoordinator _hikvisionAccess;

    public IntegracionesN8nController(
        AppDbContext context,
        IHikvisionAccessService hikvision,
        IHikvisionClientAccessCoordinator hikvisionAccess)
    {
        _context = context;
        _hikvision = hikvision;
        _hikvisionAccess = hikvisionAccess;
    }

    /// <summary>
    /// Comprueba desde el backend que el controlador remoto responde por ISAPI.
    /// Nunca devuelve credenciales ni datos de personas enroladas.
    /// </summary>
    [HttpGet("hikvision/estado")]
    public async Task<ActionResult<HikvisionDeviceResult>> ObtenerEstadoHikvision(
        CancellationToken cancellationToken)
    {
        var result = await _hikvision.ProbarConexion(cancellationToken);
        return result.Success
            ? Ok(result)
            : StatusCode(StatusCodes.Status503ServiceUnavailable, result);
    }

    /// <summary>
    /// Recalcula el acceso de todos los clientes vinculados. Este endpoint se
    /// ejecuta diariamente desde n8n y también permite reparar una caída de red.
    /// </summary>
    [HttpPost("hikvision/reconciliar")]
    public async Task<ActionResult<HikvisionReconciliationResult>> ReconciliarHikvision(
        CancellationToken cancellationToken)
    {
        var result = await _hikvisionAccess.Reconciliar(cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Fuerza la sincronización de un único cliente para altas, diagnóstico y
    /// pruebas controladas sin modificar a las demás personas del equipo.
    /// </summary>
    [HttpPost("hikvision/clientes/{idCliente:int}/sincronizar")]
    public async Task<ActionResult<HikvisionClientSyncResult>> SincronizarClienteHikvision(
        int idCliente,
        CancellationToken cancellationToken)
    {
        var cliente = await _context.Clientes.SingleOrDefaultAsync(
            item => item.IdCliente == idCliente,
            cancellationToken);
        if (cliente is null)
        {
            return NotFound(new { message = "No se encontró el cliente solicitado." });
        }

        if (string.IsNullOrWhiteSpace(cliente.HikvisionEmployeeNo))
        {
            return BadRequest(new { message = "El cliente no tiene un código Hikvision vinculado." });
        }

        var result = await _hikvisionAccess.SincronizarCliente(
            cliente,
            null,
            cancellationToken);
        return result.Success
            ? Ok(result)
            : StatusCode(StatusCodes.Status503ServiceUnavailable, result);
    }

    /// <summary>
    /// Busca el teléfono remitente y devuelve su condición de acceso, el último
    /// estado de cuota y la rutina asignada. Si hay dos registros con el mismo
    /// teléfono marca el resultado como ambiguo y no devuelve información privada.
    /// </summary>
    /// <returns>HTTP 200 con Encontrado=false para visitantes o con los datos autorizados del cliente.</returns>
    [HttpGet("clientes/por-telefono/{telefono}")]
    public async Task<ActionResult<ClienteBotResponse>> ObtenerClientePorTelefono(
        string telefono,
        CancellationToken cancellationToken)
    {
        var telefonoNormalizado = NormalizarTelefono(telefono);
        if (telefonoNormalizado is null)
        {
            return BadRequest(new { message = "El teléfono no tiene un formato válido." });
        }

        var respuesta = await ConsultarClientePorTelefono(
            telefonoNormalizado,
            cancellationToken);

        return Ok(respuesta);
    }

    /// <summary>
    /// Identifica el nivel de acceso de un teléfono para el Router de WhatsApp.
    /// Los administradores activos tienen prioridad sobre un eventual registro
    /// de cliente; los demás casos se clasifican sin exponer datos privados.
    /// </summary>
    /// <returns>
    /// HTTP 200 con TipoAcceso=SuperAdmin, Cliente, ClienteMoroso, Visitante o
    /// SinAcceso. Devuelve HTTP 400 si el teléfono no tiene un formato válido.
    /// </returns>
    [HttpGet("acceso/por-telefono/{telefono}")]
    public async Task<ActionResult<AccesoBotResponse>> ObtenerAccesoPorTelefono(
        string telefono,
        CancellationToken cancellationToken)
    {
        var telefonoNormalizado = NormalizarTelefono(telefono);
        if (telefonoNormalizado is null)
        {
            return BadRequest(new { message = "El teléfono no tiene un formato válido." });
        }

        var administradoresActivos = await _context.Entrenadores
            .AsNoTracking()
            .Where(entrenador =>
                entrenador.Estado &&
                entrenador.Rol == "Administrador")
            .OrderBy(entrenador => entrenador.IdEntrenador)
            .Select(entrenador => new
            {
                entrenador.IdEntrenador,
                entrenador.Nombre,
                entrenador.Apellido,
                entrenador.Telefono
            })
            .ToListAsync(cancellationToken);

        // Las cuentas administrativas pueden ser históricas y conservar el
        // formato local 09x; se normalizan en memoria porque son muy pocas.
        var administradores = administradoresActivos
            .Where(entrenador =>
                NormalizarTelefono(entrenador.Telefono) == telefonoNormalizado)
            .Take(2)
            .ToList();

        if (administradores.Count > 1)
        {
            return Ok(new AccesoBotResponse
            {
                TipoAcceso = "SinAcceso",
                Motivo = "AdministradorAmbiguo",
                Encontrado = true,
                Ambiguo = true,
                PermiteDatosPrivados = false,
                TelefonoNormalizado = telefonoNormalizado,
                EstadoCliente = "Ambiguo"
            });
        }

        if (administradores.Count == 1)
        {
            var administrador = administradores[0];
            return Ok(new AccesoBotResponse
            {
                TipoAcceso = "SuperAdmin",
                Encontrado = true,
                Ambiguo = false,
                PermiteDatosPrivados = true,
                IdEntrenador = administrador.IdEntrenador,
                Nombre = administrador.Nombre,
                Apellido = administrador.Apellido,
                TelefonoNormalizado = telefonoNormalizado,
                EstadoCliente = "AdministradorActivo"
            });
        }

        var cliente = await ConsultarClientePorTelefono(
            telefonoNormalizado,
            cancellationToken);

        return Ok(CrearAccesoCliente(cliente));
    }

    private async Task<ClienteBotResponse> ConsultarClientePorTelefono(
        string telefonoNormalizado,
        CancellationToken cancellationToken)
    {
        var clientes = await _context.Clientes
            .AsNoTracking()
            .Include(cliente => cliente.Rutina)
            .Where(cliente => cliente.Telefono == telefonoNormalizado)
            .OrderByDescending(cliente => cliente.Estado)
            .Take(2)
            .ToListAsync(cancellationToken);

        if (clientes.Count == 0)
        {
            return new ClienteBotResponse
            {
                Encontrado = false,
                TelefonoNormalizado = telefonoNormalizado
            };
        }

        if (clientes.Count > 1)
        {
            return new ClienteBotResponse
            {
                Encontrado = true,
                Ambiguo = true,
                PermiteDatosPrivados = false,
                TelefonoNormalizado = telefonoNormalizado,
                EstadoCliente = "Ambiguo"
            };
        }

        var cliente = clientes[0];
        var ultimaCuota = await _context.Cuotas
            .AsNoTracking()
            .Where(cuota =>
                cuota.IdCliente == cliente.IdCliente &&
                cuota.EstadoPago == PagoConfirmado)
            .OrderByDescending(cuota => cuota.FechaVencimiento)
            .ThenByDescending(cuota => cuota.FechaPago)
            .Select(cuota => new
            {
                cuota.FechaInicio,
                cuota.FechaVencimiento
            })
            .FirstOrDefaultAsync(cancellationToken);

        var estadoCuota = CrearEstadoCuota(
            cliente.FechaRegistro,
            ultimaCuota?.FechaInicio,
            ultimaCuota?.FechaVencimiento);
        var estadoCliente = !cliente.Estado
            ? "Inactivo"
            : estadoCuota.DiasVencido > 0
                ? "Vencido"
                : "Activo";

        return new ClienteBotResponse
        {
            Encontrado = true,
            Ambiguo = false,
            PermiteDatosPrivados = cliente.Estado,
            IdCliente = cliente.IdCliente,
            Nombre = cliente.Nombre,
            Apellido = cliente.Apellido,
            TelefonoNormalizado = telefonoNormalizado,
            EstadoCliente = estadoCliente,
            AceptaWhatsApp = cliente.AceptaWhatsApp && cliente.FechaBajaWhatsApp is null,
            Cuota = estadoCuota,
            Rutina = new RutinaBotResponse
            {
                IdRutina = cliente.Rutina.IdRutina,
                Nombre = cliente.Rutina.Nombre,
                NombreArchivoPdf = cliente.Rutina.NombreArchivoPdf,
                CantidadPaginas = cliente.Rutina.CantidadPaginas,
                TamanoBytes = cliente.Rutina.TamanoBytes,
                PdfEndpoint = $"/api/integraciones/n8n/clientes/{cliente.IdCliente}/rutina/pdf"
            }
        };
    }

    /// <summary>
    /// Reserva un mensaje entrante usando el ID único entregado por Meta. La
    /// primera ejecución recibe Procesar=true; cualquier reintento posterior
    /// recibe Duplicado=true y debe finalizar sin responder otra vez.
    /// </summary>
    [HttpPost("mensajes/reservar")]
    public async Task<ActionResult<ReservarMensajeWhatsappResponse>> ReservarMensaje(
        [FromBody] ReservarMensajeWhatsappRequest request,
        CancellationToken cancellationToken)
    {
        var idMensajeMeta = request.IdMensajeMeta.Trim();
        var telefonoNormalizado = NormalizarTelefono(request.Telefono);
        if (telefonoNormalizado is null)
        {
            return BadRequest(new { message = "El teléfono no tiene un formato válido." });
        }

        var existente = await _context.MensajesWhatsapp
            .AsNoTracking()
            .Where(mensaje => mensaje.IdMensajeMeta == idMensajeMeta)
            .Select(mensaje => new
            {
                mensaje.IdMensajeWhatsapp,
                mensaje.IdCliente
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (existente is not null)
        {
            return Ok(new ReservarMensajeWhatsappResponse
            {
                Procesar = false,
                Duplicado = true,
                IdMensajeWhatsapp = existente.IdMensajeWhatsapp,
                IdCliente = existente.IdCliente,
                TelefonoNormalizado = telefonoNormalizado
            });
        }

        var idsCliente = await _context.Clientes
            .AsNoTracking()
            .Where(cliente => cliente.Telefono == telefonoNormalizado)
            .Select(cliente => cliente.IdCliente)
            .Take(2)
            .ToListAsync(cancellationToken);

        var mensaje = new MensajeWhatsapp
        {
            IdMensajeMeta = idMensajeMeta,
            Telefono = telefonoNormalizado,
            Direccion = "Entrante",
            Tipo = request.Tipo.Trim(),
            Resumen = Limpiar(request.Resumen),
            EstadoProcesamiento = "Reservado",
            FechaRecepcion = DateTime.UtcNow,
            IdCliente = idsCliente.Count == 1 ? idsCliente[0] : null
        };

        _context.MensajesWhatsapp.Add(mensaje);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception) when (
            exception.InnerException is PostgresException
            {
                SqlState: PostgresErrorCodes.UniqueViolation
            })
        {
            // El índice único también cubre dos webhooks concurrentes que
            // superaron la consulta anterior casi al mismo tiempo.
            return Ok(new ReservarMensajeWhatsappResponse
            {
                Procesar = false,
                Duplicado = true,
                TelefonoNormalizado = telefonoNormalizado
            });
        }

        return Ok(new ReservarMensajeWhatsappResponse
        {
            Procesar = true,
            Duplicado = false,
            IdMensajeWhatsapp = mensaje.IdMensajeWhatsapp,
            IdCliente = mensaje.IdCliente,
            TelefonoNormalizado = telefonoNormalizado
        });
    }

    /// <summary>
    /// Cierra la auditoría mínima de un mensaje entrante. n8n informa si terminó,
    /// ignoró o falló; el backend incrementa intentos y conserva solo un error
    /// técnico acotado, no el contenido completo de la conversación.
    /// </summary>
    /// <returns>HTTP 204 al persistir el resultado o 404 si la reserva no existe.</returns>
    [HttpPost("mensajes/resultado")]
    public async Task<IActionResult> RegistrarResultadoMensaje(
        [FromBody] ResultadoMensajeWhatsappRequest request,
        CancellationToken cancellationToken)
    {
        var estadosPermitidos = new[] { "Procesado", "Ignorado", "Fallido" };
        var estado = estadosPermitidos.FirstOrDefault(valor =>
            valor.Equals(request.Estado.Trim(), StringComparison.OrdinalIgnoreCase));
        if (estado is null)
        {
            return BadRequest(new
            {
                message = "El estado debe ser Procesado, Ignorado o Fallido."
            });
        }

        var mensaje = await _context.MensajesWhatsapp.SingleOrDefaultAsync(
            item => item.IdMensajeWhatsapp == request.IdMensajeWhatsapp,
            cancellationToken);
        if (mensaje is null)
        {
            return NotFound(new { message = "No se encontró el mensaje reservado." });
        }

        mensaje.EstadoProcesamiento = estado;
        mensaje.Intentos++;
        mensaje.UltimoError = estado == "Fallido" ? Limpiar(request.Error) : null;
        mensaje.FechaProcesamiento = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Previsualiza clientes activos y con consentimiento cuya cuota vence en
    /// la cantidad de días indicada. Es una lectura y no reserva envíos.
    /// </summary>
    [HttpGet("cobranzas")]
    public async Task<ActionResult<IReadOnlyCollection<NotificacionN8nResponse>>> ObtenerCobranzas(
        [FromQuery, Range(0, 30)] int dias = 3,
        CancellationToken cancellationToken = default)
    {
        var candidatos = await ObtenerCandidatosCobranza(dias, cancellationToken);
        return Ok(candidatos.Select(MapearCandidatoSinReserva).ToList());
    }

    /// <summary>
    /// Reserva de forma persistente los avisos que vencen en N días. El workflow
    /// de cobranza debe usar este POST: la clave única evita envíos duplicados
    /// aunque el cron se ejecute nuevamente.
    /// </summary>
    [HttpPost("cobranzas/reservar")]
    public async Task<ActionResult<IReadOnlyCollection<NotificacionN8nResponse>>> ReservarCobranzas(
        [FromQuery, Range(0, 30)] int dias = 3,
        CancellationToken cancellationToken = default)
    {
        var candidatos = await ObtenerCandidatosCobranza(dias, cancellationToken);
        if (candidatos.Count == 0)
        {
            return Ok(Array.Empty<NotificacionN8nResponse>());
        }

        var ahora = DateTime.UtcNow;
        var notificaciones = candidatos.Select(candidato => new Notificacion
        {
            IdCliente = candidato.IdCliente,
            Tipo = "CobranzaTresDias",
            Mensaje = "Aviso de vencimiento de cuota pendiente de envío.",
            FechaProgramada = ahora,
            Estado = "Reservada",
            ClaveIdempotencia = candidato.ClaveIdempotencia,
            Canal = "WhatsApp",
            Referencia = candidato.FechaVencimiento.ToString("yyyy-MM-dd"),
            FechaCreacion = ahora
        }).ToList();

        _context.Notificaciones.AddRange(notificaciones);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception) when (
            exception.InnerException is PostgresException
            {
                SqlState: PostgresErrorCodes.UniqueViolation
            })
        {
            return Conflict(new
            {
                message = "Otro proceso reservó uno de los avisos. Volvé a consultar las cobranzas pendientes."
            });
        }

        var respuesta = notificaciones.Zip(candidatos, (notificacion, candidato) =>
            new NotificacionN8nResponse
            {
                IdNotificacion = notificacion.IdNotificacion,
                Tipo = notificacion.Tipo,
                ClaveIdempotencia = notificacion.ClaveIdempotencia!,
                Referencia = notificacion.Referencia,
                IdCliente = candidato.IdCliente,
                NombreCliente = candidato.NombreCliente,
                Telefono = candidato.Telefono,
                FechaVencimiento = candidato.FechaVencimiento,
                FechaProgramadaUtc = notificacion.FechaProgramada,
                Estado = notificacion.Estado
            }).ToList();

        return Ok(respuesta);
    }

    /// <summary>
    /// Devuelve el outbox de notificaciones todavía procesables. Se utiliza
    /// para rutinas asignadas y para reintentar fallos sin perder eventos.
    /// </summary>
    [HttpGet("notificaciones/pendientes")]
    public async Task<ActionResult<IReadOnlyCollection<NotificacionN8nResponse>>> ObtenerPendientes(
        [FromQuery] string? tipo,
        [FromQuery, Range(1, 100)] int limite = 50,
        CancellationToken cancellationToken = default)
    {
        var limiteProcesoAbandonado = DateTime.UtcNow.AddMinutes(-15);
        var consulta = _context.Notificaciones
            .AsNoTracking()
            .Where(notificacion =>
                notificacion.FechaProgramada <= DateTime.UtcNow &&
                (notificacion.Estado == "Pendiente" ||
                 notificacion.Estado == "Reservada" ||
                 notificacion.Estado == "Fallida" ||
                 (notificacion.Estado == "Procesando" &&
                  notificacion.FechaActualizacion <= limiteProcesoAbandonado)) &&
                notificacion.ClaveIdempotencia != null &&
                notificacion.Cliente.Estado &&
                notificacion.Cliente.AceptaWhatsApp &&
                notificacion.Cliente.FechaBajaWhatsApp == null);

        if (!string.IsNullOrWhiteSpace(tipo))
        {
            var tipoNormalizado = tipo.Trim();
            consulta = consulta.Where(notificacion => notificacion.Tipo == tipoNormalizado);
        }

        var notificaciones = await consulta
            .OrderBy(notificacion => notificacion.FechaProgramada)
            .Take(limite)
            .Select(notificacion => new NotificacionN8nResponse
            {
                IdNotificacion = notificacion.IdNotificacion,
                Tipo = notificacion.Tipo,
                ClaveIdempotencia = notificacion.ClaveIdempotencia!,
                Referencia = notificacion.Referencia,
                IdCliente = notificacion.IdCliente,
                NombreCliente = notificacion.Cliente.Nombre + " " + notificacion.Cliente.Apellido,
                Telefono = notificacion.Cliente.Telefono,
                FechaProgramadaUtc = notificacion.FechaProgramada,
                Estado = notificacion.Estado
            })
            .ToListAsync(cancellationToken);

        return Ok(notificaciones);
    }

    /// <summary>
    /// Toma una notificación mediante un UPDATE atómico antes de llamar a Meta.
    /// Solo un worker obtiene HTTP 204; los demás reciben 409 y deben omitir el
    /// envío. También recupera procesos abandonados durante más de 15 minutos.
    /// </summary>
    [HttpPost("notificaciones/{idNotificacion:int}/tomar")]
    public async Task<IActionResult> TomarNotificacion(
        int idNotificacion,
        CancellationToken cancellationToken)
    {
        var ahora = DateTime.UtcNow;
        var limiteProcesoAbandonado = ahora.AddMinutes(-15);
        var actualizadas = await _context.Notificaciones
            .Where(notificacion =>
                notificacion.IdNotificacion == idNotificacion &&
                notificacion.Cliente.Estado &&
                notificacion.Cliente.AceptaWhatsApp &&
                notificacion.Cliente.FechaBajaWhatsApp == null &&
                (notificacion.Estado == "Pendiente" ||
                 notificacion.Estado == "Reservada" ||
                 notificacion.Estado == "Fallida" ||
                 (notificacion.Estado == "Procesando" &&
                  notificacion.FechaActualizacion <= limiteProcesoAbandonado)))
            .ExecuteUpdateAsync(actualizacion => actualizacion
                .SetProperty(notificacion => notificacion.Estado, "Procesando")
                .SetProperty(notificacion => notificacion.FechaActualizacion, ahora),
                cancellationToken);

        if (actualizadas != 1)
        {
            return Conflict(new { message = "La notificación ya fue tomada o finalizada." });
        }

        return NoContent();
    }

    /// <summary>
    /// Registra el resultado informado por Meta/n8n. Devuelve 204 cuando el
    /// estado quedó persistido y 404 si el identificador no existe.
    /// </summary>
    [HttpPost("notificaciones/resultado")]
    public async Task<IActionResult> RegistrarResultadoNotificacion(
        [FromBody] ResultadoNotificacionRequest request,
        CancellationToken cancellationToken)
    {
        var estadosPermitidos = new[]
        {
            "Enviada", "Entregada", "Leida", "Fallida", "Cancelada"
        };
        var estado = estadosPermitidos.FirstOrDefault(valor =>
            valor.Equals(request.Estado.Trim(), StringComparison.OrdinalIgnoreCase));

        if (estado is null)
        {
            return BadRequest(new
            {
                message = "El estado debe ser Enviada, Entregada, Leida, Fallida o Cancelada."
            });
        }

        var notificacion = await _context.Notificaciones.SingleOrDefaultAsync(
            item => item.IdNotificacion == request.IdNotificacion,
            cancellationToken);
        if (notificacion is null)
        {
            return NotFound(new { message = "No se encontró la notificación indicada." });
        }

        var ahora = DateTime.UtcNow;
        notificacion.Estado = estado;
        notificacion.IdMensajeExterno = Limpiar(request.IdMensajeExterno);
        notificacion.UltimoError = estado == "Fallida" ? Limpiar(request.Error) : null;
        notificacion.Intentos++;
        notificacion.FechaActualizacion = ahora;

        if (estado == "Enviada")
        {
            notificacion.FechaEnvio ??= ahora;
        }
        else if (estado == "Entregada")
        {
            notificacion.FechaEnvio ??= ahora;
            notificacion.FechaEntrega = ahora;
        }
        else if (estado == "Leida")
        {
            notificacion.FechaEnvio ??= ahora;
            notificacion.FechaEntrega ??= ahora;
            notificacion.FechaLectura = ahora;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Aplica el consentimiento o la baja solicitada por un número registrado.
    /// Devuelve conflicto ante teléfonos duplicados para no modificar al cliente equivocado.
    /// </summary>
    [HttpPost("consentimiento")]
    public async Task<ActionResult<ActualizarConsentimientoWhatsappResponse>> ActualizarConsentimiento(
        [FromBody] ActualizarConsentimientoWhatsappRequest request,
        CancellationToken cancellationToken)
    {
        var telefonoNormalizado = NormalizarTelefono(request.Telefono);
        if (telefonoNormalizado is null)
        {
            return BadRequest(new { message = "El teléfono no tiene un formato válido." });
        }

        var clientes = await _context.Clientes
            .Where(cliente => cliente.Telefono == telefonoNormalizado)
            .Take(2)
            .ToListAsync(cancellationToken);

        if (clientes.Count == 0)
        {
            return NotFound(new { message = "No existe un cliente con ese teléfono." });
        }

        if (clientes.Count > 1)
        {
            return Conflict(new
            {
                message = "El teléfono pertenece a más de un cliente y requiere revisión administrativa."
            });
        }

        var cliente = clientes[0];
        var ahora = DateTime.UtcNow;
        cliente.AceptaWhatsApp = request.Acepta;
        cliente.FechaConsentimientoWhatsApp = request.Acepta ? ahora : cliente.FechaConsentimientoWhatsApp;
        cliente.FechaBajaWhatsApp = request.Acepta ? null : ahora;

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new ActualizarConsentimientoWhatsappResponse
        {
            IdCliente = cliente.IdCliente,
            TelefonoNormalizado = cliente.Telefono,
            AceptaWhatsApp = cliente.AceptaWhatsApp,
            FechaConsentimientoUtc = cliente.FechaConsentimientoWhatsApp,
            FechaBajaUtc = cliente.FechaBajaWhatsApp
        });
    }

    /// <summary>
    /// Devuelve metadatos de la rutina actual para que n8n prepare el mensaje.
    /// No devuelve el contenido binario; este se obtiene por el endpoint /pdf.
    /// </summary>
    [HttpGet("clientes/{idCliente:int}/rutina")]
    public async Task<ActionResult<RutinaBotResponse>> ObtenerRutinaCliente(
        int idCliente,
        CancellationToken cancellationToken)
    {
        var rutina = await _context.Clientes
            .AsNoTracking()
            .Where(cliente => cliente.IdCliente == idCliente)
            .Select(cliente => new RutinaBotResponse
            {
                IdRutina = cliente.Rutina.IdRutina,
                Nombre = cliente.Rutina.Nombre,
                NombreArchivoPdf = cliente.Rutina.NombreArchivoPdf,
                CantidadPaginas = cliente.Rutina.CantidadPaginas,
                TamanoBytes = cliente.Rutina.TamanoBytes,
                PdfEndpoint = $"/api/integraciones/n8n/clientes/{idCliente}/rutina/pdf"
            })
            .SingleOrDefaultAsync(cancellationToken);

        return rutina is null
            ? NotFound(new { message = "No se encontró el cliente o su rutina." })
            : Ok(rutina);
    }

    /// <summary>
    /// Descarga interna y autenticada del PDF asignado. n8n puede tomar este
    /// binario y subirlo a Meta sin publicar una URL privada de la rutina.
    /// </summary>
    [HttpGet("clientes/{idCliente:int}/rutina/pdf")]
    public async Task<IActionResult> ObtenerPdfRutinaCliente(
        int idCliente,
        CancellationToken cancellationToken)
    {
        var archivo = await _context.Clientes
            .AsNoTracking()
            .Where(cliente => cliente.IdCliente == idCliente)
            .Select(cliente => new
            {
                cliente.Rutina.ContenidoPdf,
                cliente.Rutina.TipoContenidoPdf,
                cliente.Rutina.NombreArchivoPdf
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (archivo?.ContenidoPdf is null || archivo.ContenidoPdf.Length == 0)
        {
            return NotFound(new { message = "La rutina no tiene un PDF almacenado." });
        }

        Response.Headers.CacheControl = "private, no-store";
        return File(
            archivo.ContenidoPdf,
            archivo.TipoContenidoPdf ?? "application/pdf",
            Path.GetFileName(archivo.NombreArchivoPdf));
    }

    private async Task<List<CandidatoCobranza>> ObtenerCandidatosCobranza(
        int dias,
        CancellationToken cancellationToken)
    {
        var clientes = await _context.Clientes
            .AsNoTracking()
            .Where(cliente =>
                cliente.Estado &&
                cliente.AceptaWhatsApp &&
                cliente.FechaBajaWhatsApp == null)
            .Select(cliente => new
            {
                cliente.IdCliente,
                cliente.Nombre,
                cliente.Apellido,
                cliente.Telefono,
                cliente.FechaRegistro,
                UltimaFechaVencimiento = cliente.Cuotas
                    .Where(cuota => cuota.EstadoPago == PagoConfirmado)
                    .OrderByDescending(cuota => cuota.FechaVencimiento)
                    .Select(cuota => (DateOnly?)cuota.FechaVencimiento)
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        var objetivo = FechaGimnasio.Hoy().AddDays(dias);
        var preliminares = clientes
            .Select(cliente => new
            {
                Cliente = cliente,
                FechaVencimiento = cliente.UltimaFechaVencimiento ??
                    FechaGimnasio.DesdeUtc(cliente.FechaRegistro).AddMonths(1)
            })
            .Where(item => item.FechaVencimiento == objetivo)
            .Select(item => new CandidatoCobranza(
                item.Cliente.IdCliente,
                $"{item.Cliente.Nombre} {item.Cliente.Apellido}".Trim(),
                item.Cliente.Telefono,
                item.FechaVencimiento,
                $"cobranza:{item.Cliente.IdCliente}:{item.FechaVencimiento:yyyyMMdd}"))
            .ToList();

        if (preliminares.Count == 0)
        {
            return preliminares;
        }

        var claves = preliminares.Select(item => item.ClaveIdempotencia).ToList();
        var existentes = await _context.Notificaciones
            .AsNoTracking()
            .Where(notificacion =>
                notificacion.ClaveIdempotencia != null &&
                claves.Contains(notificacion.ClaveIdempotencia))
            .Select(notificacion => notificacion.ClaveIdempotencia!)
            .ToHashSetAsync(cancellationToken);

        return preliminares
            .Where(item => !existentes.Contains(item.ClaveIdempotencia))
            .ToList();
    }

    private static EstadoCuotaBotResponse CrearEstadoCuota(
        DateTime fechaRegistro,
        DateOnly? fechaInicio,
        DateOnly? fechaVencimiento)
    {
        var inicioInicial = FechaGimnasio.DesdeUtc(fechaRegistro);
        var inicio = fechaInicio ?? inicioInicial;
        var vencimiento = fechaVencimiento ?? inicioInicial.AddMonths(1);
        var diferencia = vencimiento.DayNumber - FechaGimnasio.Hoy().DayNumber;

        return new EstadoCuotaBotResponse
        {
            Estado = diferencia switch
            {
                < 0 => "Vencida",
                0 => "VenceHoy",
                <= 5 => "PorVencer",
                _ => "Vigente"
            },
            FechaInicio = inicio,
            FechaVencimiento = vencimiento,
            DiasRestantes = Math.Max(0, diferencia),
            DiasVencido = diferencia < 0 ? Math.Abs(diferencia) : 0
        };
    }

    private static AccesoBotResponse CrearAccesoCliente(ClienteBotResponse cliente)
    {
        if (!cliente.Encontrado)
        {
            return new AccesoBotResponse
            {
                TipoAcceso = "Visitante",
                Motivo = "NoRegistrado",
                Encontrado = false,
                Ambiguo = false,
                PermiteDatosPrivados = false,
                TelefonoNormalizado = cliente.TelefonoNormalizado,
                EstadoCliente = "NoRegistrado"
            };
        }

        if (cliente.Ambiguo)
        {
            return new AccesoBotResponse
            {
                TipoAcceso = "SinAcceso",
                Motivo = "ClienteAmbiguo",
                Encontrado = true,
                Ambiguo = true,
                PermiteDatosPrivados = false,
                TelefonoNormalizado = cliente.TelefonoNormalizado,
                EstadoCliente = "Ambiguo"
            };
        }

        if (cliente.EstadoCliente == "Vencido")
        {
            return new AccesoBotResponse
            {
                TipoAcceso = "ClienteMoroso",
                Motivo = "CuotaVencida",
                Encontrado = true,
                Ambiguo = false,
                PermiteDatosPrivados = false,
                TelefonoNormalizado = cliente.TelefonoNormalizado,
                EstadoCliente = cliente.EstadoCliente
            };
        }

        if (!cliente.PermiteDatosPrivados || cliente.EstadoCliente != "Activo")
        {
            return new AccesoBotResponse
            {
                TipoAcceso = "SinAcceso",
                Motivo = cliente.EstadoCliente == "Inactivo"
                    ? "ClienteInactivo"
                    : "EstadoNoAutorizado",
                Encontrado = true,
                Ambiguo = false,
                PermiteDatosPrivados = false,
                TelefonoNormalizado = cliente.TelefonoNormalizado,
                EstadoCliente = cliente.EstadoCliente
            };
        }

        return new AccesoBotResponse
        {
            TipoAcceso = "Cliente",
            Encontrado = true,
            Ambiguo = false,
            PermiteDatosPrivados = true,
            IdCliente = cliente.IdCliente,
            Nombre = cliente.Nombre,
            Apellido = cliente.Apellido,
            TelefonoNormalizado = cliente.TelefonoNormalizado,
            EstadoCliente = cliente.EstadoCliente,
            AceptaWhatsApp = cliente.AceptaWhatsApp,
            Cuota = cliente.Cuota,
            Rutina = cliente.Rutina
        };
    }

    private static NotificacionN8nResponse MapearCandidatoSinReserva(CandidatoCobranza candidato)
    {
        return new NotificacionN8nResponse
        {
            Tipo = "CobranzaTresDias",
            ClaveIdempotencia = candidato.ClaveIdempotencia,
            IdCliente = candidato.IdCliente,
            NombreCliente = candidato.NombreCliente,
            Telefono = candidato.Telefono,
            FechaVencimiento = candidato.FechaVencimiento,
            FechaProgramadaUtc = DateTime.UtcNow,
            Estado = "SinReservar"
        };
    }

    private static string? NormalizarTelefono(string? telefono)
    {
        if (string.IsNullOrWhiteSpace(telefono))
        {
            return null;
        }

        var digitos = Regex.Replace(telefono, "[^0-9]", string.Empty);
        if (digitos.Length == 9 && digitos.StartsWith('0'))
        {
            digitos = "598" + digitos[1..];
        }
        else if (digitos.Length == 8)
        {
            digitos = "598" + digitos;
        }

        return Regex.IsMatch(digitos, "^598[0-9]{8}$") ? digitos : null;
    }

    private static string? Limpiar(string? valor)
    {
        return string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
    }

    private sealed record CandidatoCobranza(
        int IdCliente,
        string NombreCliente,
        string Telefono,
        DateOnly FechaVencimiento,
        string ClaveIdempotencia);
}
