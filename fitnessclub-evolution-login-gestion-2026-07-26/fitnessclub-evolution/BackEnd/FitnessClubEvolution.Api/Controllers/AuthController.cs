using System.Security.Claims;
using FitnessClubEvolution.Api.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitnessClubEvolution.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<SesionResponse>> Login(
            [FromBody] LoginRequest request)
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

            var nombreUsuarioNormalizado = nombreUsuario.ToLower();
            var entrenador = await _context.Entrenadores
                .AsNoTracking()
                .FirstOrDefaultAsync(e =>
                    e.Nombre.ToLower() == nombreUsuarioNormalizado);

            if (entrenador is null || entrenador.Contrasena != request.Contrasena)
            {
                return Unauthorized(new
                {
                    mensaje = "El usuario o la contraseña son incorrectos."
                });
            }

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, entrenador.IdEntrenador.ToString()),
                new(ClaimTypes.Name, entrenador.Nombre),
                new(ClaimTypes.GivenName, entrenador.Nombre),
                new(ClaimTypes.Surname, entrenador.Apellido),
                new(ClaimTypes.Role, "Administrador")
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

            return Ok(CrearRespuestaSesion(
                entrenador.IdEntrenador,
                entrenador.Nombre,
                entrenador.Apellido));
        }

        [Authorize]
        [HttpGet("sesion")]
        public ActionResult<SesionResponse> ObtenerSesion()
        {
            var idEntrenadorTexto = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(idEntrenadorTexto, out var idEntrenador))
            {
                return Unauthorized();
            }

            return Ok(CrearRespuestaSesion(
                idEntrenador,
                User.FindFirstValue(ClaimTypes.GivenName) ?? string.Empty,
                User.FindFirstValue(ClaimTypes.Surname) ?? string.Empty));
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(
                CookieAuthenticationDefaults.AuthenticationScheme);

            return NoContent();
        }

        private static SesionResponse CrearRespuestaSesion(
            int idEntrenador,
            string nombre,
            string apellido)
        {
            return new SesionResponse(
                idEntrenador,
                nombre,
                apellido,
                string.Join(" ", new[] { nombre, apellido }
                    .Where(valor => !string.IsNullOrWhiteSpace(valor))),
                "Administrador");
        }
    }

    public sealed record LoginRequest(
        string NombreUsuario,
        string Contrasena,
        bool MantenerSesion = false);

    public sealed record SesionResponse(
        int IdEntrenador,
        string NombreUsuario,
        string Apellido,
        string NombreCompleto,
        string Rol);
}
