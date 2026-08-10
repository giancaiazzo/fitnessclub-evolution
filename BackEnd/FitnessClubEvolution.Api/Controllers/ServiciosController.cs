using FitnessClubEvolution.Api.Data;
using FitnessClubEvolution.Api.DTOs;
using FitnessClubEvolution.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitnessClubEvolution.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ServiciosController : ControllerBase
{
    public const long MaxImagenBytes = 5 * 1024 * 1024;

    private readonly AppDbContext _context;

    public ServiciosController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/servicios?buscar=musculacion
    // La lectura es pública porque alimenta el catálogo del módulo de clientes.
    // El atributo [Authorize] de la clase sigue protegiendo POST, PUT y DELETE.
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<ServicioResponse>>> ObtenerServicios(
        [FromQuery] string? buscar,
        CancellationToken cancellationToken)
    {
        var consulta = _context.Servicios.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(buscar))
        {
            var patron = $"%{buscar.Trim()}%";
            consulta = consulta.Where(servicio => EF.Functions.ILike(servicio.Nombre, patron));
        }

        var servicios = await consulta
            .OrderBy(servicio => servicio.Nombre)
            .Select(servicio => new ServicioResponse
            {
                IdServicio = servicio.IdServicio,
                Nombre = servicio.Nombre,
                Descripcion = servicio.Descripcion,
                Precio = servicio.Precio,
                Duracion = servicio.Duracion,
                TieneImagen = servicio.Imagen != null,
                NombreArchivoImagen = servicio.NombreArchivoImagen,
                TipoContenidoImagen = servicio.TipoContenidoImagen,
                ImagenUrl = servicio.Imagen == null
                    ? null
                    : $"/api/servicios/{servicio.IdServicio}/imagen"
            })
            .ToListAsync(cancellationToken);

        return Ok(servicios);
    }

    // GET: api/servicios/5
    // Permite consultar el detalle sin iniciar sesión desde el portal público.
    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ServicioResponse>> ObtenerServicioPorId(
        int id,
        CancellationToken cancellationToken)
    {
        var servicio = await _context.Servicios
            .AsNoTracking()
            .Where(servicio => servicio.IdServicio == id)
            .Select(servicio => new ServicioResponse
            {
                IdServicio = servicio.IdServicio,
                Nombre = servicio.Nombre,
                Descripcion = servicio.Descripcion,
                Precio = servicio.Precio,
                Duracion = servicio.Duracion,
                TieneImagen = servicio.Imagen != null,
                NombreArchivoImagen = servicio.NombreArchivoImagen,
                TipoContenidoImagen = servicio.TipoContenidoImagen,
                ImagenUrl = servicio.Imagen == null
                    ? null
                    : $"/api/servicios/{servicio.IdServicio}/imagen"
            })
            .SingleOrDefaultAsync(cancellationToken);

        return servicio is null
            ? NotFound(new { message = "No se encontró el servicio solicitado." })
            : Ok(servicio);
    }

    // GET: api/servicios/5/imagen
    // La imagen también debe ser pública para que las tarjetas puedan mostrarla.
    [AllowAnonymous]
    [HttpGet("{id:int}/imagen")]
    public async Task<IActionResult> ObtenerImagen(
        int id,
        CancellationToken cancellationToken)
    {
        var imagen = await _context.Servicios
            .AsNoTracking()
            .Where(servicio => servicio.IdServicio == id)
            .Select(servicio => new
            {
                servicio.Imagen,
                servicio.TipoContenidoImagen
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (imagen?.Imagen is null || imagen.Imagen.Length == 0)
        {
            return NotFound(new { message = "El servicio no tiene una imagen cargada." });
        }

        Response.Headers.CacheControl = "private, no-store";
        return File(
            imagen.Imagen,
            imagen.TipoContenidoImagen ?? "application/octet-stream");
    }

    // POST: api/servicios
    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxImagenBytes + 1024 * 1024)]
    public async Task<ActionResult<ServicioResponse>> CrearServicio(
        [FromForm] CrearServicioRequest request,
        CancellationToken cancellationToken)
    {
        var nombre = request.Nombre.Trim();
        if (await ExisteNombre(nombre, null, cancellationToken))
        {
            return Conflict(new { message = "Ya existe un servicio con ese nombre." });
        }

        ArchivoImagen? archivoImagen = null;
        if (request.Imagen is not null)
        {
            var validacion = await LeerImagen(request.Imagen, cancellationToken);
            if (validacion.Error is not null)
            {
                return BadRequest(new { message = validacion.Error });
            }

            archivoImagen = validacion.Archivo;
        }

        var servicio = new Servicio
        {
            Nombre = nombre,
            Descripcion = Limpiar(request.Descripcion),
            Precio = request.Precio,
            Duracion = Limpiar(request.Duracion),
            Imagen = archivoImagen?.Contenido,
            NombreArchivoImagen = archivoImagen?.Nombre,
            TipoContenidoImagen = archivoImagen?.TipoContenido
        };

        _context.Servicios.Add(servicio);
        await _context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(
            nameof(ObtenerServicioPorId),
            new { id = servicio.IdServicio },
            Mapear(servicio));
    }

    // PUT: api/servicios/5
    [HttpPut("{id:int}")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxImagenBytes + 1024 * 1024)]
    public async Task<ActionResult<ServicioResponse>> ActualizarServicio(
        int id,
        [FromForm] ActualizarServicioRequest request,
        CancellationToken cancellationToken)
    {
        var servicio = await _context.Servicios.SingleOrDefaultAsync(
            servicio => servicio.IdServicio == id,
            cancellationToken);

        if (servicio is null)
        {
            return NotFound(new { message = "No se encontró el servicio solicitado." });
        }

        var nombre = request.Nombre.Trim();
        if (await ExisteNombre(nombre, id, cancellationToken))
        {
            return Conflict(new { message = "Ya existe otro servicio con ese nombre." });
        }

        ArchivoImagen? archivoImagen = null;
        if (request.Imagen is not null)
        {
            var validacion = await LeerImagen(request.Imagen, cancellationToken);
            if (validacion.Error is not null)
            {
                return BadRequest(new { message = validacion.Error });
            }

            archivoImagen = validacion.Archivo;
        }

        servicio.Nombre = nombre;
        servicio.Descripcion = Limpiar(request.Descripcion);
        servicio.Precio = request.Precio;
        servicio.Duracion = Limpiar(request.Duracion);

        if (request.EliminarImagen)
        {
            servicio.Imagen = null;
            servicio.NombreArchivoImagen = null;
            servicio.TipoContenidoImagen = null;
        }

        if (archivoImagen is not null)
        {
            servicio.Imagen = archivoImagen.Contenido;
            servicio.NombreArchivoImagen = archivoImagen.Nombre;
            servicio.TipoContenidoImagen = archivoImagen.TipoContenido;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Ok(Mapear(servicio));
    }

    // DELETE: api/servicios/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> EliminarServicio(
        int id,
        CancellationToken cancellationToken)
    {
        var servicio = await _context.Servicios.SingleOrDefaultAsync(
            servicio => servicio.IdServicio == id,
            cancellationToken);

        if (servicio is null)
        {
            return NotFound(new { message = "No se encontró el servicio solicitado." });
        }

        _context.Servicios.Remove(servicio);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private Task<bool> ExisteNombre(
        string nombre,
        int? idExcluir,
        CancellationToken cancellationToken)
    {
        return _context.Servicios.AnyAsync(
            servicio =>
                (!idExcluir.HasValue || servicio.IdServicio != idExcluir.Value) &&
                EF.Functions.ILike(servicio.Nombre, nombre),
            cancellationToken);
    }

    private static async Task<ValidacionImagen> LeerImagen(
        IFormFile imagen,
        CancellationToken cancellationToken)
    {
        if (imagen.Length == 0)
        {
            return new(null, "La imagen seleccionada está vacía.");
        }

        if (imagen.Length > MaxImagenBytes)
        {
            return new(null, "La imagen no puede superar los 5 MB.");
        }

        await using var memoria = new MemoryStream();
        await imagen.CopyToAsync(memoria, cancellationToken);
        var contenido = memoria.ToArray();
        var tipoContenido = DetectarTipoImagen(contenido);

        if (tipoContenido is null)
        {
            return new(null, "La imagen debe ser JPG, PNG o WEBP y tener un contenido válido.");
        }

        var nombre = NombreImagenSeguro(imagen.FileName, tipoContenido);

        return new(new ArchivoImagen(contenido, nombre, tipoContenido), null);
    }

    private static string? DetectarTipoImagen(byte[] contenido)
    {
        if (contenido.Length >= 3 &&
            contenido[0] == 0xFF && contenido[1] == 0xD8 && contenido[2] == 0xFF)
        {
            return "image/jpeg";
        }

        if (contenido.Length >= 8 &&
            contenido[0] == 0x89 && contenido[1] == 0x50 &&
            contenido[2] == 0x4E && contenido[3] == 0x47 &&
            contenido[4] == 0x0D && contenido[5] == 0x0A &&
            contenido[6] == 0x1A && contenido[7] == 0x0A)
        {
            return "image/png";
        }

        if (contenido.Length >= 12 &&
            contenido[0] == (byte)'R' && contenido[1] == (byte)'I' &&
            contenido[2] == (byte)'F' && contenido[3] == (byte)'F' &&
            contenido[8] == (byte)'W' && contenido[9] == (byte)'E' &&
            contenido[10] == (byte)'B' && contenido[11] == (byte)'P')
        {
            return "image/webp";
        }

        return null;
    }

    private static string ExtensionImagen(string tipoContenido) => tipoContenido switch
    {
        "image/jpeg" => ".jpg",
        "image/png" => ".png",
        "image/webp" => ".webp",
        _ => string.Empty
    };

    private static string NombreImagenSeguro(string? nombreOriginal, string tipoContenido)
    {
        var extension = ExtensionImagen(tipoContenido);
        var nombreBase = Path.GetFileNameWithoutExtension(
            Path.GetFileName(nombreOriginal ?? string.Empty)).Trim();

        if (string.IsNullOrWhiteSpace(nombreBase))
        {
            nombreBase = $"servicio-{Guid.NewGuid():N}";
        }

        var maximoBase = 255 - extension.Length;
        if (nombreBase.Length > maximoBase)
        {
            nombreBase = nombreBase[..maximoBase];
        }

        return nombreBase + extension;
    }

    private static ServicioResponse Mapear(Servicio servicio)
    {
        var tieneImagen = servicio.Imagen is { Length: > 0 };
        return new ServicioResponse
        {
            IdServicio = servicio.IdServicio,
            Nombre = servicio.Nombre,
            Descripcion = servicio.Descripcion,
            Precio = servicio.Precio,
            Duracion = servicio.Duracion,
            TieneImagen = tieneImagen,
            NombreArchivoImagen = servicio.NombreArchivoImagen,
            TipoContenidoImagen = servicio.TipoContenidoImagen,
            ImagenUrl = tieneImagen
                ? $"/api/servicios/{servicio.IdServicio}/imagen"
                : null
        };
    }

    private static string? Limpiar(string? valor)
    {
        return string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
    }

    private sealed record ArchivoImagen(byte[] Contenido, string Nombre, string TipoContenido);
    private sealed record ValidacionImagen(ArchivoImagen? Archivo, string? Error);
}
