using FitnessClubEvolution.Api.Data;
using FitnessClubEvolution.Api.DTOs;
using FitnessClubEvolution.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UglyToad.PdfPig;

namespace FitnessClubEvolution.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RutinasController : ControllerBase
{
    public const int MaxPaginasPdf = 10;
    public const long MaxPdfBytes = 10 * 1024 * 1024;

    private readonly AppDbContext _context;

    public RutinasController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// MÓDULO 2: consulta metadatos de rutinas sin transferir los PDF guardados
    /// en PostgreSQL. Devuelve una URL de descarga cuando existe contenido.
    /// </summary>
    /// <returns>HTTP 200 con rutinas ordenadas por fecha de carga.</returns>
    // GET: api/rutinas?buscar=adaptacion
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<RutinaResponse>>> ObtenerRutinas(
        [FromQuery] string? buscar,
        CancellationToken cancellationToken)
    {
        var consulta = _context.Rutinas.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(buscar))
        {
            var patron = $"%{buscar.Trim()}%";
            consulta = consulta.Where(rutina => EF.Functions.ILike(rutina.Nombre, patron));
        }

        var rutinas = await consulta
            .OrderByDescending(rutina => rutina.FechaCarga)
            .ThenBy(rutina => rutina.Nombre)
            .Select(rutina => new RutinaResponse
            {
                IdRutina = rutina.IdRutina,
                Nombre = rutina.Nombre,
                Descripcion = rutina.Descripcion,
                NombreArchivoPdf = rutina.NombreArchivoPdf,
                CantidadPaginas = rutina.CantidadPaginas,
                TamanoBytes = rutina.TamanoBytes,
                FechaCarga = rutina.FechaCarga,
                TienePdf = rutina.ContenidoPdf != null,
                PdfUrl = rutina.ContenidoPdf == null
                    ? null
                    : $"/api/rutinas/{rutina.IdRutina}/pdf"
            })
            .ToListAsync(cancellationToken);

        return Ok(rutinas);
    }

    // GET: api/rutinas/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<RutinaResponse>> ObtenerRutinaPorId(
        int id,
        CancellationToken cancellationToken)
    {
        var rutina = await _context.Rutinas
            .AsNoTracking()
            .Where(rutina => rutina.IdRutina == id)
            .Select(rutina => new RutinaResponse
            {
                IdRutina = rutina.IdRutina,
                Nombre = rutina.Nombre,
                Descripcion = rutina.Descripcion,
                NombreArchivoPdf = rutina.NombreArchivoPdf,
                CantidadPaginas = rutina.CantidadPaginas,
                TamanoBytes = rutina.TamanoBytes,
                FechaCarga = rutina.FechaCarga,
                TienePdf = rutina.ContenidoPdf != null,
                PdfUrl = rutina.ContenidoPdf == null
                    ? null
                    : $"/api/rutinas/{rutina.IdRutina}/pdf"
            })
            .SingleOrDefaultAsync(cancellationToken);

        return rutina is null
            ? NotFound(new { message = "No se encontró la rutina solicitada." })
            : Ok(rutina);
    }

    /// <summary>
    /// MÓDULOS 2 Y 3: obtiene el PDF binario de una rutina. El panel lo muestra
    /// en línea; n8n usa un endpoint interno equivalente para enviarlo por Meta.
    /// </summary>
    /// <returns>El PDF o HTTP 404 cuando aún no fue cargado.</returns>
    // GET: api/rutinas/5/pdf
    [HttpGet("{id:int}/pdf")]
    public async Task<IActionResult> ObtenerPdf(
        int id,
        CancellationToken cancellationToken)
    {
        var archivo = await _context.Rutinas
            .AsNoTracking()
            .Where(rutina => rutina.IdRutina == id)
            .Select(rutina => new
            {
                rutina.ContenidoPdf,
                rutina.TipoContenidoPdf,
                rutina.NombreArchivoPdf
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (archivo?.ContenidoPdf is null || archivo.ContenidoPdf.Length == 0)
        {
            return NotFound(new { message = "La rutina no tiene un PDF almacenado." });
        }

        var nombre = NombreArchivoSeguro(archivo.NombreArchivoPdf);
        Response.Headers.ContentDisposition =
            $"inline; filename*=UTF-8''{Uri.EscapeDataString(nombre)}";
        Response.Headers.CacheControl = "private, max-age=300";

        return File(archivo.ContenidoPdf, archivo.TipoContenidoPdf ?? "application/pdf");
    }

    /// <summary>
    /// MÓDULO 2: valida firma, tamaño, cantidad de páginas y nombre único antes
    /// de almacenar el PDF y sus metadatos en PostgreSQL.
    /// </summary>
    /// <returns>HTTP 201 con metadatos de la rutina; 400/409 ante una validación fallida.</returns>
    // POST: api/rutinas
    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxPdfBytes + 1024 * 1024)]
    public async Task<ActionResult<RutinaResponse>> CrearRutina(
        [FromForm] CrearRutinaRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Pdf is null)
        {
            return BadRequest(new { message = "Seleccioná el archivo PDF de la rutina." });
        }

        var nombre = request.Nombre.Trim();
        if (await ExisteNombre(nombre, null, cancellationToken))
        {
            return Conflict(new { message = "Ya existe una rutina con ese nombre." });
        }

        var validacion = await LeerPdf(request.Pdf, cancellationToken);
        if (validacion.Error is not null || validacion.Archivo is null)
        {
            return BadRequest(new { message = validacion.Error ?? "El PDF no es válido." });
        }

        var rutina = new Rutina
        {
            Nombre = nombre,
            Descripcion = Limpiar(request.Descripcion),
            NombreArchivoPdf = validacion.Archivo.Nombre,
            TipoContenidoPdf = "application/pdf",
            ContenidoPdf = validacion.Archivo.Contenido,
            CantidadPaginas = validacion.Archivo.CantidadPaginas,
            TamanoBytes = validacion.Archivo.Contenido.LongLength,
            FechaCarga = DateTime.UtcNow
        };

        _context.Rutinas.Add(rutina);
        await _context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(
            nameof(ObtenerRutinaPorId),
            new { id = rutina.IdRutina },
            Mapear(rutina));
    }

    // PUT: api/rutinas/5
    [HttpPut("{id:int}")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxPdfBytes + 1024 * 1024)]
    public async Task<ActionResult<RutinaResponse>> ActualizarRutina(
        int id,
        [FromForm] ActualizarRutinaRequest request,
        CancellationToken cancellationToken)
    {
        var rutina = await _context.Rutinas.SingleOrDefaultAsync(
            rutina => rutina.IdRutina == id,
            cancellationToken);

        if (rutina is null)
        {
            return NotFound(new { message = "No se encontró la rutina solicitada." });
        }

        var nombre = request.Nombre.Trim();
        if (await ExisteNombre(nombre, id, cancellationToken))
        {
            return Conflict(new { message = "Ya existe otra rutina con ese nombre." });
        }

        ArchivoPdf? nuevoPdf = null;
        if (request.Pdf is not null)
        {
            var validacion = await LeerPdf(request.Pdf, cancellationToken);
            if (validacion.Error is not null || validacion.Archivo is null)
            {
                return BadRequest(new { message = validacion.Error ?? "El PDF no es válido." });
            }

            nuevoPdf = validacion.Archivo;
        }
        else if (rutina.ContenidoPdf is null)
        {
            return BadRequest(new
            {
                message = "Esta rutina proviene de un registro anterior y todavía no tiene un PDF almacenado. Seleccioná uno para actualizarla."
            });
        }

        rutina.Nombre = nombre;
        rutina.Descripcion = Limpiar(request.Descripcion);

        if (nuevoPdf is not null)
        {
            rutina.NombreArchivoPdf = nuevoPdf.Nombre;
            rutina.TipoContenidoPdf = "application/pdf";
            rutina.ContenidoPdf = nuevoPdf.Contenido;
            rutina.CantidadPaginas = nuevoPdf.CantidadPaginas;
            rutina.TamanoBytes = nuevoPdf.Contenido.LongLength;
            rutina.FechaCarga = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Ok(Mapear(rutina));
    }

    // DELETE: api/rutinas/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> EliminarRutina(
        int id,
        CancellationToken cancellationToken)
    {
        var rutina = await _context.Rutinas.SingleOrDefaultAsync(
            rutina => rutina.IdRutina == id,
            cancellationToken);

        if (rutina is null)
        {
            return NotFound(new { message = "No se encontró la rutina solicitada." });
        }

        var clientesAsignados = await _context.Clientes.CountAsync(
            cliente => cliente.IdRutina == id,
            cancellationToken);

        if (clientesAsignados > 0)
        {
            var sustantivo = clientesAsignados == 1 ? "cliente" : "clientes";
            return Conflict(new
            {
                message = $"No se puede eliminar la rutina porque está asignada a {clientesAsignados} {sustantivo}. Reasignalos antes de eliminarla."
            });
        }

        _context.Rutinas.Remove(rutina);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private Task<bool> ExisteNombre(
        string nombre,
        int? idExcluir,
        CancellationToken cancellationToken)
    {
        return _context.Rutinas.AnyAsync(
            rutina =>
                (!idExcluir.HasValue || rutina.IdRutina != idExcluir.Value) &&
                EF.Functions.ILike(rutina.Nombre, nombre),
            cancellationToken);
    }

    private static async Task<ValidacionPdf> LeerPdf(
        IFormFile pdf,
        CancellationToken cancellationToken)
    {
        if (pdf.Length == 0)
        {
            return new(null, "El PDF seleccionado está vacío.");
        }

        if (pdf.Length > MaxPdfBytes)
        {
            return new(null, "El PDF no puede superar los 10 MB.");
        }

        await using var memoria = new MemoryStream();
        await pdf.CopyToAsync(memoria, cancellationToken);
        var contenido = memoria.ToArray();

        if (!TieneFirmaPdf(contenido))
        {
            return new(null, "El archivo debe ser un PDF válido.");
        }

        int cantidadPaginas;
        try
        {
            using var flujoPdf = new MemoryStream(contenido, writable: false);
            using var documento = PdfDocument.Open(flujoPdf);
            cantidadPaginas = documento.NumberOfPages;
        }
        catch (Exception excepcion) when (excepcion is not OperationCanceledException)
        {
            return new(null, "No se pudo leer el PDF. Puede estar dañado o protegido con contraseña.");
        }

        if (cantidadPaginas < 1)
        {
            return new(null, "El PDF debe contener al menos una página.");
        }

        if (cantidadPaginas > MaxPaginasPdf)
        {
            return new(
                null,
                $"El PDF tiene {cantidadPaginas} páginas. El máximo permitido es {MaxPaginasPdf}.");
        }

        return new(
            new ArchivoPdf(
                contenido,
                NombreArchivoSeguro(pdf.FileName),
                cantidadPaginas),
            null);
    }

    private static bool TieneFirmaPdf(byte[] contenido)
    {
        return contenido.Length >= 5 &&
               contenido[0] == (byte)'%' &&
               contenido[1] == (byte)'P' &&
               contenido[2] == (byte)'D' &&
               contenido[3] == (byte)'F' &&
               contenido[4] == (byte)'-';
    }

    private static string NombreArchivoSeguro(string? nombreOriginal)
    {
        var nombre = Path.GetFileName(nombreOriginal ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(nombre))
        {
            return $"rutina-{Guid.NewGuid():N}.pdf";
        }

        if (!nombre.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
        {
            nombre += ".pdf";
        }

        if (nombre.Length <= 255)
        {
            return nombre;
        }

        return $"{Path.GetFileNameWithoutExtension(nombre)[..251]}.pdf";
    }

    private static RutinaResponse Mapear(Rutina rutina)
    {
        var tienePdf = rutina.ContenidoPdf is { Length: > 0 };
        return new RutinaResponse
        {
            IdRutina = rutina.IdRutina,
            Nombre = rutina.Nombre,
            Descripcion = rutina.Descripcion,
            NombreArchivoPdf = rutina.NombreArchivoPdf,
            CantidadPaginas = rutina.CantidadPaginas,
            TamanoBytes = rutina.TamanoBytes,
            FechaCarga = rutina.FechaCarga,
            TienePdf = tienePdf,
            PdfUrl = tienePdf ? $"/api/rutinas/{rutina.IdRutina}/pdf" : null
        };
    }

    private static string? Limpiar(string? valor)
    {
        return string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
    }

    private sealed record ArchivoPdf(byte[] Contenido, string Nombre, int CantidadPaginas);
    private sealed record ValidacionPdf(ArchivoPdf? Archivo, string? Error);
}
