using FitnessClubEvolution.Api.Data;
using FitnessClubEvolution.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitnessClubEvolution.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EntrenadoresController : ControllerBase
{
    private readonly AppDbContext _context;

    public EntrenadoresController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/entrenadores
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<EntrenadorPagoResponse>>> ObtenerEntrenadores(
        CancellationToken cancellationToken)
    {
        var entrenadores = await _context.Entrenadores
            .AsNoTracking()
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
}
