using FitnessClubEvolution.Api.Data;
using FitnessClubEvolution.Api.DTOs;
using FitnessClubEvolution.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitnessClubEvolution.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EntrenadoresController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<Entrenador> _passwordHasher;

    public EntrenadoresController(
        AppDbContext context,
        IPasswordHasher<Entrenador> passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    /// <summary>
    /// MÓDULO 2: consulta el personal disponible para atribuir un cobro. Solo
    /// proyecta identificador y nombre; no carga credenciales ni las devuelve.
    /// </summary>
    /// <returns>HTTP 200 con los entrenadores activos ordenados alfabéticamente.</returns>
    // GET: api/entrenadores
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<EntrenadorPagoResponse>>> ObtenerEntrenadores(
        CancellationToken cancellationToken)
    {
        var entrenadores = await _context.Entrenadores
            .AsNoTracking()
            .Where(entrenador => entrenador.Estado)
            .OrderBy(entrenador => entrenador.Apellido)
            .ThenBy(entrenador => entrenador.Nombre)
            .Select(entrenador => new EntrenadorPagoResponse
            {
                IdEntrenador = entrenador.IdEntrenador,
                Nombre = entrenador.Nombre,
                Apellido = entrenador.Apellido
            })
            .ToListAsync(cancellationToken);

        return Ok(entrenadores);
    }

    /// <summary>
    /// MÓDULO 2: crea una cuenta de panel verificando que el usuario no exista.
    /// La contraseña se transforma con PasswordHasher antes de guardar y jamás
    /// se persiste ni se devuelve en texto plano.
    /// </summary>
    /// <returns>HTTP 201 con la cuenta sin datos sensibles; 409 si el usuario ya existe.</returns>
    [Authorize(Roles = "Administrador")]
    [HttpPost]
    public async Task<ActionResult<EntrenadorResponse>> CrearEntrenador(
        [FromBody] CrearEntrenadorRequest request,
        CancellationToken cancellationToken)
    {
        var nombreUsuario = request.NombreUsuario.Trim();
        var nombreUsuarioNormalizado = nombreUsuario.ToUpperInvariant();
        var existe = await _context.Entrenadores.AnyAsync(
            entrenador => entrenador.NombreUsuarioNormalizado == nombreUsuarioNormalizado,
            cancellationToken);

        if (existe)
        {
            return Conflict(new { message = "Ya existe una cuenta con ese nombre de usuario." });
        }

        var entrenador = new Entrenador
        {
            Nombre = request.Nombre.Trim(),
            Apellido = request.Apellido.Trim(),
            Telefono = request.Telefono.Trim(),
            NombreUsuario = nombreUsuario,
            NombreUsuarioNormalizado = nombreUsuarioNormalizado,
            Rol = request.Rol,
            Estado = true,
            FechaCreacion = DateTime.UtcNow,
            Contrasena = null
        };
        entrenador.ContrasenaHash = _passwordHasher.HashPassword(
            entrenador,
            request.Contrasena);

        _context.Entrenadores.Add(entrenador);
        await _context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(
            nameof(ObtenerEntrenadorPorId),
            new { id = entrenador.IdEntrenador },
            Mapear(entrenador));
    }

    /// <summary>
    /// MÓDULO 2: consulta una cuenta por su identificador y devuelve únicamente
    /// datos administrativos; nunca incluye contraseña ni hash.
    /// </summary>
    [Authorize(Roles = "Administrador")]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<EntrenadorResponse>> ObtenerEntrenadorPorId(
        int id,
        CancellationToken cancellationToken)
    {
        var entrenador = await _context.Entrenadores
            .AsNoTracking()
            .Where(item => item.IdEntrenador == id)
            .Select(item => new EntrenadorResponse
            {
                IdEntrenador = item.IdEntrenador,
                Nombre = item.Nombre,
                Apellido = item.Apellido,
                Telefono = item.Telefono,
                NombreUsuario = item.NombreUsuario,
                Rol = item.Rol,
                Estado = item.Estado,
                FechaCreacion = item.FechaCreacion,
                UltimoAcceso = item.UltimoAcceso
            })
            .SingleOrDefaultAsync(cancellationToken);

        return entrenador is null
            ? NotFound(new { message = "No se encontró la cuenta solicitada." })
            : Ok(entrenador);
    }

    private static EntrenadorResponse Mapear(Entrenador entrenador)
    {
        return new EntrenadorResponse
        {
            IdEntrenador = entrenador.IdEntrenador,
            Nombre = entrenador.Nombre,
            Apellido = entrenador.Apellido,
            Telefono = entrenador.Telefono,
            NombreUsuario = entrenador.NombreUsuario,
            Rol = entrenador.Rol,
            Estado = entrenador.Estado,
            FechaCreacion = entrenador.FechaCreacion,
            UltimoAcceso = entrenador.UltimoAcceso
        };
    }
}
