using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Security.Claims;
using System.Security.Cryptography;
using FitnessClubEvolution.Api.Data;
using FitnessClubEvolution.Api.Models;
using FitnessClubEvolution.Api.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace FitnessClubEvolution.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private const int MinutosValidezCodigo = 10;
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<Entrenador> _passwordHasher;
    private readonly IPasswordHasher<SolicitudRecuperacion> _recoveryHasher;
    private readonly IRecoveryEmailSender _recoveryEmailSender;

    public AuthController(
        AppDbContext context,
        IPasswordHasher<Entrenador> passwordHasher,
        IPasswordHasher<SolicitudRecuperacion> recoveryHasher,
        IRecoveryEmailSender recoveryEmailSender)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _recoveryHasher = recoveryHasher;
        _recoveryEmailSender = recoveryEmailSender;
    }

    /// <summary>
    /// MÓDULO 2: consulta un entrenador activo por nombre de usuario normalizado,
    /// verifica el hash de contraseña y crea la cookie segura de sesión.
    /// También migra una contraseña histórica en texto plano al primer acceso.
    /// </summary>
    /// <returns>Datos mínimos de la sesión; nunca devuelve contraseña ni hash.</returns>
    [AllowAnonymous]
    [EnableRateLimiting("Autenticacion")]
    [HttpPost("login")]
    public async Task<ActionResult<SesionResponse>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var nombreUsuario = request.NombreUsuario.Trim();
        if (string.IsNullOrWhiteSpace(nombreUsuario) ||
            string.IsNullOrWhiteSpace(request.Contrasena))
        {
            return BadRequest(new
            {
                mensaje = "Debes ingresar el usuario y la contraseña."
            });
        }

        var nombreUsuarioNormalizado = NormalizarNombreUsuario(nombreUsuario);
        var entrenador = await _context.Entrenadores
            .SingleOrDefaultAsync(
                item => item.NombreUsuarioNormalizado == nombreUsuarioNormalizado,
                cancellationToken);

        if (entrenador is null || !entrenador.Estado ||
            !VerificarContrasena(entrenador, request.Contrasena, out var actualizarHash))
        {
            return Unauthorized(new
            {
                mensaje = "El usuario o la contraseña son incorrectos."
            });
        }

        if (actualizarHash)
        {
            entrenador.ContrasenaHash = _passwordHasher.HashPassword(
                entrenador,
                request.Contrasena);
        }

        // Después de una autenticación válida se elimina definitivamente el
        // valor heredado en texto plano, si todavía existía.
        entrenador.Contrasena = null;
        entrenador.UltimoAcceso = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, entrenador.IdEntrenador.ToString(CultureInfo.InvariantCulture)),
            new(ClaimTypes.Name, entrenador.NombreUsuario),
            new(ClaimTypes.GivenName, entrenador.Nombre),
            new(ClaimTypes.Surname, entrenador.Apellido),
            new(ClaimTypes.Role, entrenador.Rol)
        };

        var identidad = new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme);
        var propiedades = new AuthenticationProperties
        {
            IsPersistent = request.MantenerSesion,
            AllowRefresh = true,
            ExpiresUtc = DateTimeOffset.UtcNow.Add(
                request.MantenerSesion
                    ? TimeSpan.FromDays(7)
                    : TimeSpan.FromHours(8))
        };

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(identidad),
            propiedades);

        return Ok(CrearRespuestaSesion(entrenador));
    }

    /// <summary>
    /// MÓDULO 2: lee los claims de la cookie autenticada y devuelve quién está
    /// usando el panel. No realiza una consulta de datos sensibles.
    /// </summary>
    [Authorize]
    [HttpGet("sesion")]
    public ActionResult<SesionResponse> ObtenerSesion()
    {
        var idEntrenadorTexto = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(idEntrenadorTexto, out var idEntrenador))
        {
            return Unauthorized();
        }

        var nombre = User.FindFirstValue(ClaimTypes.GivenName) ?? string.Empty;
        var apellido = User.FindFirstValue(ClaimTypes.Surname) ?? string.Empty;
        return Ok(new SesionResponse(
            idEntrenador,
            User.FindFirstValue(ClaimTypes.Name) ?? string.Empty,
            nombre,
            apellido,
            string.Join(" ", new[] { nombre, apellido }
                .Where(valor => !string.IsNullOrWhiteSpace(valor))),
            User.FindFirstValue(ClaimTypes.Role) ?? "Administrador"));
    }

    /// <summary>
    /// MÓDULO 2: elimina la cookie de autenticación. Devuelve HTTP 204 porque no
    /// hay contenido adicional que el frontend deba procesar.
    /// </summary>
    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(
            CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }

    /// <summary>
    /// MÓDULO 2: genera un código de un solo uso, guarda únicamente su hash y lo
    /// envía al correo asociado a la cuenta. La respuesta siempre es genérica
    /// para impedir que terceros descubran qué direcciones están registradas.
    /// </summary>
    [AllowAnonymous]
    [EnableRateLimiting("Recuperacion")]
    [HttpPost("recuperacion/solicitar")]
    public async Task<IActionResult> SolicitarRecuperacion(
        [FromBody] SolicitarRecuperacionRequest request,
        CancellationToken cancellationToken)
    {
        var respuestaGenerica = new
        {
            mensaje = "Si el correo está asociado a una cuenta activa, recibirás un código para continuar."
        };
        var correoNormalizado = NormalizarCorreo(request.CorreoElectronico);
        var entrenador = await _context.Entrenadores.SingleOrDefaultAsync(
            item =>
                item.CorreoElectronicoNormalizado == correoNormalizado &&
                item.Estado,
            cancellationToken);

        if (entrenador is null)
        {
            return Accepted(respuestaGenerica);
        }

        if (string.IsNullOrWhiteSpace(entrenador.CorreoElectronico))
        {
            return Accepted(respuestaGenerica);
        }

        var ahora = DateTime.UtcNow;
        var solicitudesAnteriores = await _context.SolicitudesRecuperacion
            .Where(solicitud =>
                solicitud.IdEntrenador == entrenador.IdEntrenador &&
                solicitud.Estado == "Pendiente")
            .ToListAsync(cancellationToken);
        foreach (var anterior in solicitudesAnteriores)
        {
            anterior.Estado = "Reemplazada";
        }

        var codigo = RandomNumberGenerator
            .GetInt32(0, 1_000_000)
            .ToString("D6", CultureInfo.InvariantCulture);
        var solicitud = new SolicitudRecuperacion
        {
            IdEntrenador = entrenador.IdEntrenador,
            FechaCreacion = ahora,
            FechaExpiracion = ahora.AddMinutes(MinutosValidezCodigo),
            Estado = "Pendiente",
            Intentos = 0,
            MaxIntentos = 5,
            IpSolicitud = HttpContext.Connection.RemoteIpAddress?.ToString()
        };
        solicitud.CodigoHash = _recoveryHasher.HashPassword(solicitud, codigo);

        _context.SolicitudesRecuperacion.Add(solicitud);
        await _context.SaveChangesAsync(cancellationToken);

        var resultado = await _recoveryEmailSender.EnviarCodigoAsync(
            entrenador.CorreoElectronico,
            entrenador.Nombre,
            codigo,
            solicitud.FechaExpiracion,
            cancellationToken);

        // El resultado del envío se registra en la propia solicitud; un fallo
        // obliga a generar otra y evita reutilizar códigos que no se entregaron.
        if (!resultado.Entregado)
        {
            solicitud.Estado = "ErrorEnvio";
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Accepted(respuestaGenerica);
    }

    /// <summary>
    /// MÓDULO 2: verifica vencimiento, intentos y hash del código; si es válido,
    /// reemplaza la contraseña por un hash ASP.NET y consume la solicitud.
    /// </summary>
    /// <returns>HTTP 204 al cambiar la contraseña; 400 para códigos inválidos o vencidos.</returns>
    [AllowAnonymous]
    [EnableRateLimiting("Recuperacion")]
    [HttpPost("recuperacion/confirmar")]
    public async Task<IActionResult> ConfirmarRecuperacion(
        [FromBody] ConfirmarRecuperacionRequest request,
        CancellationToken cancellationToken)
    {
        var correoNormalizado = NormalizarCorreo(request.CorreoElectronico);
        var entrenador = await _context.Entrenadores.SingleOrDefaultAsync(
            item =>
                item.CorreoElectronicoNormalizado == correoNormalizado &&
                item.Estado,
            cancellationToken);

        if (entrenador is null)
        {
            return BadRequest(new { mensaje = "El código es inválido o venció." });
        }

        var solicitud = await _context.SolicitudesRecuperacion
            .Where(item =>
                item.IdEntrenador == entrenador.IdEntrenador &&
                item.Estado == "Pendiente")
            .OrderByDescending(item => item.FechaCreacion)
            .FirstOrDefaultAsync(cancellationToken);

        if (solicitud is null || solicitud.FechaExpiracion <= DateTime.UtcNow)
        {
            if (solicitud is not null)
            {
                solicitud.Estado = "Vencida";
                await _context.SaveChangesAsync(cancellationToken);
            }

            return BadRequest(new { mensaje = "El código es inválido o venció." });
        }

        if (solicitud.Intentos >= solicitud.MaxIntentos)
        {
            solicitud.Estado = "Bloqueada";
            await _context.SaveChangesAsync(cancellationToken);
            return BadRequest(new { mensaje = "El código es inválido o venció." });
        }

        var resultado = _recoveryHasher.VerifyHashedPassword(
            solicitud,
            solicitud.CodigoHash,
            request.Codigo.Trim());
        if (resultado == PasswordVerificationResult.Failed)
        {
            solicitud.Intentos++;
            if (solicitud.Intentos >= solicitud.MaxIntentos)
            {
                solicitud.Estado = "Bloqueada";
            }

            await _context.SaveChangesAsync(cancellationToken);
            return BadRequest(new { mensaje = "El código es inválido o venció." });
        }

        entrenador.ContrasenaHash = _passwordHasher.HashPassword(
            entrenador,
            request.NuevaContrasena);
        entrenador.Contrasena = null;
        solicitud.Estado = "Utilizada";
        solicitud.FechaUso = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(entrenador.CorreoElectronico))
        {
            await _recoveryEmailSender.EnviarConfirmacionAsync(
                entrenador.CorreoElectronico,
                entrenador.Nombre,
                cancellationToken);
        }

        return NoContent();
    }

    private bool VerificarContrasena(
        Entrenador entrenador,
        string contrasena,
        out bool actualizarHash)
    {
        actualizarHash = false;
        if (!string.IsNullOrWhiteSpace(entrenador.ContrasenaHash))
        {
            var resultado = _passwordHasher.VerifyHashedPassword(
                entrenador,
                entrenador.ContrasenaHash,
                contrasena);
            actualizarHash = resultado == PasswordVerificationResult.SuccessRehashNeeded;
            return resultado != PasswordVerificationResult.Failed;
        }

        actualizarHash = entrenador.Contrasena == contrasena;
        return actualizarHash;
    }

    private static SesionResponse CrearRespuestaSesion(Entrenador entrenador)
    {
        return new SesionResponse(
            entrenador.IdEntrenador,
            entrenador.NombreUsuario,
            entrenador.Nombre,
            entrenador.Apellido,
            string.Join(" ", new[] { entrenador.Nombre, entrenador.Apellido }
                .Where(valor => !string.IsNullOrWhiteSpace(valor))),
            entrenador.Rol);
    }

    private static string NormalizarNombreUsuario(string valor)
    {
        return valor.Trim().ToUpperInvariant();
    }

    private static string NormalizarCorreo(string correoElectronico) =>
        correoElectronico.Trim().ToUpperInvariant();
}

public sealed record LoginRequest(
    string NombreUsuario,
    string Contrasena,
    bool MantenerSesion = false);

public sealed record SesionResponse(
    int IdEntrenador,
    string NombreUsuario,
    string Nombre,
    string Apellido,
    string NombreCompleto,
    string Rol);

public sealed class SolicitarRecuperacionRequest
{
    [Required, EmailAddress, StringLength(254)]
    public string CorreoElectronico { get; set; } = string.Empty;
}

public sealed class ConfirmarRecuperacionRequest
{
    [Required, EmailAddress, StringLength(254)]
    public string CorreoElectronico { get; set; } = string.Empty;

    [Required, RegularExpression("^[0-9]{6}$", ErrorMessage = "El código debe contener seis números.")]
    public string Codigo { get; set; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 8)]
    public string NuevaContrasena { get; set; } = string.Empty;
}
