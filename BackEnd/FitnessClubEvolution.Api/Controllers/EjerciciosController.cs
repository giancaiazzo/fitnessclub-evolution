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
public class EjerciciosController : ControllerBase
{
    public const long MaxImagenBytes = 5 * 1024 * 1024;
    public const long MaxVideoBytes = 30 * 1024 * 1024;
    public const int MaxDuracionVideoSegundos = 60;

    private readonly AppDbContext _context;

    public EjerciciosController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// MÓDULO 1: consulta ejercicios activos y proyecta metadatos, no los
    /// binarios. Un usuario autenticado puede incluir inactivos para gestionarlos.
    /// </summary>
    /// <returns>HTTP 200 con ejercicios filtrados y las URLs de imagen/video disponibles.</returns>
    // GET: api/ejercicios?buscar=press&grupoMuscular=Pecho
    // El portal público solamente recibe ejercicios activos. Un administrador
    // autenticado puede solicitar también los inactivos para gestionarlos.
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<EjercicioResponse>>> ObtenerEjercicios(
        [FromQuery] string? buscar,
        [FromQuery] string? grupoMuscular,
        [FromQuery] bool incluirInactivos = false,
        CancellationToken cancellationToken = default)
    {
        var consulta = _context.Ejercicios.AsNoTracking().AsQueryable();

        if (!incluirInactivos || !EstaAutenticado())
        {
            consulta = consulta.Where(ejercicio => ejercicio.Estado);
        }

        if (!string.IsNullOrWhiteSpace(buscar))
        {
            var patron = $"%{buscar.Trim()}%";
            consulta = consulta.Where(ejercicio =>
                EF.Functions.ILike(ejercicio.Nombre, patron) ||
                (ejercicio.Descripcion != null &&
                 EF.Functions.ILike(ejercicio.Descripcion, patron)));
        }

        if (!string.IsNullOrWhiteSpace(grupoMuscular))
        {
            var grupo = grupoMuscular.Trim();
            consulta = consulta.Where(ejercicio =>
                EF.Functions.ILike(ejercicio.GrupoMuscular, grupo));
        }

        var ejercicios = await consulta
            .OrderBy(ejercicio => ejercicio.GrupoMuscular)
            .ThenBy(ejercicio => ejercicio.Nombre)
            .Select(ejercicio => new EjercicioResponse
            {
                IdEjercicio = ejercicio.IdEjercicio,
                Nombre = ejercicio.Nombre,
                GrupoMuscular = ejercicio.GrupoMuscular,
                Descripcion = ejercicio.Descripcion,
                Estado = ejercicio.Estado,
                TieneImagenPreview = ejercicio.ImagenPreview != null,
                NombreArchivoImagen = ejercicio.NombreArchivoImagen,
                TipoContenidoImagen = ejercicio.TipoContenidoImagen,
                TamanoImagenBytes = ejercicio.TamanoImagenBytes,
                ImagenPreviewUrl = ejercicio.ImagenPreview == null
                    ? null
                    : $"/api/ejercicios/{ejercicio.IdEjercicio}/imagen",
                TieneVideoTutorial = ejercicio.VideoTutorial != null,
                NombreArchivoVideo = ejercicio.NombreArchivoVideo,
                TipoContenidoVideo = ejercicio.TipoContenidoVideo,
                TamanoVideoBytes = ejercicio.TamanoVideoBytes,
                DuracionVideoSegundos = ejercicio.DuracionVideoSegundos,
                VideoTutorialUrl = ejercicio.VideoTutorial == null
                    ? null
                    : $"/api/ejercicios/{ejercicio.IdEjercicio}/video",
                FechaRegistro = ejercicio.FechaRegistro,
                FechaActualizacion = ejercicio.FechaActualizacion
            })
            .ToListAsync(cancellationToken);

        return Ok(ejercicios);
    }

    // GET: api/ejercicios/5
    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<EjercicioResponse>> ObtenerEjercicioPorId(
        int id,
        CancellationToken cancellationToken)
    {
        var estaAutenticado = EstaAutenticado();
        var ejercicio = await _context.Ejercicios
            .AsNoTracking()
            .Where(ejercicio =>
                ejercicio.IdEjercicio == id &&
                (ejercicio.Estado || estaAutenticado))
            .Select(ejercicio => new EjercicioResponse
            {
                IdEjercicio = ejercicio.IdEjercicio,
                Nombre = ejercicio.Nombre,
                GrupoMuscular = ejercicio.GrupoMuscular,
                Descripcion = ejercicio.Descripcion,
                Estado = ejercicio.Estado,
                TieneImagenPreview = ejercicio.ImagenPreview != null,
                NombreArchivoImagen = ejercicio.NombreArchivoImagen,
                TipoContenidoImagen = ejercicio.TipoContenidoImagen,
                TamanoImagenBytes = ejercicio.TamanoImagenBytes,
                ImagenPreviewUrl = ejercicio.ImagenPreview == null
                    ? null
                    : $"/api/ejercicios/{ejercicio.IdEjercicio}/imagen",
                TieneVideoTutorial = ejercicio.VideoTutorial != null,
                NombreArchivoVideo = ejercicio.NombreArchivoVideo,
                TipoContenidoVideo = ejercicio.TipoContenidoVideo,
                TamanoVideoBytes = ejercicio.TamanoVideoBytes,
                DuracionVideoSegundos = ejercicio.DuracionVideoSegundos,
                VideoTutorialUrl = ejercicio.VideoTutorial == null
                    ? null
                    : $"/api/ejercicios/{ejercicio.IdEjercicio}/video",
                FechaRegistro = ejercicio.FechaRegistro,
                FechaActualizacion = ejercicio.FechaActualizacion
            })
            .SingleOrDefaultAsync(cancellationToken);

        return ejercicio is null
            ? NotFound(new { message = "No se encontró el ejercicio solicitado." })
            : Ok(ejercicio);
    }

    // GET: api/ejercicios/5/imagen
    [AllowAnonymous]
    [HttpGet("{id:int}/imagen")]
    public async Task<IActionResult> ObtenerImagenPreview(
        int id,
        CancellationToken cancellationToken)
    {
        var archivo = await _context.Ejercicios
            .AsNoTracking()
            .Where(ejercicio => ejercicio.IdEjercicio == id)
            .Select(ejercicio => new
            {
                ejercicio.Estado,
                ejercicio.ImagenPreview,
                ejercicio.TipoContenidoImagen
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (archivo is null || (!archivo.Estado && !EstaAutenticado()))
        {
            return NotFound(new { message = "No se encontró el ejercicio solicitado." });
        }

        if (archivo.ImagenPreview is null || archivo.ImagenPreview.Length == 0)
        {
            return NotFound(new { message = "El ejercicio no tiene una imagen de vista previa." });
        }

        Response.Headers.CacheControl = "private, max-age=300";
        return File(
            archivo.ImagenPreview,
            archivo.TipoContenidoImagen ?? "application/octet-stream");
    }

    /// <summary>
    /// MÓDULO 1: consulta el video del ejercicio y habilita respuestas por rango,
    /// permitiendo al navegador adelantar sin descargar nuevamente todo el archivo.
    /// </summary>
    /// <returns>El video binario o HTTP 404 si está ausente/no es visible.</returns>
    // GET: api/ejercicios/5/video
    [AllowAnonymous]
    [HttpGet("{id:int}/video")]
    public async Task<IActionResult> ObtenerVideoTutorial(
        int id,
        CancellationToken cancellationToken)
    {
        var archivo = await _context.Ejercicios
            .AsNoTracking()
            .Where(ejercicio => ejercicio.IdEjercicio == id)
            .Select(ejercicio => new
            {
                ejercicio.Estado,
                ejercicio.VideoTutorial,
                ejercicio.TipoContenidoVideo
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (archivo is null || (!archivo.Estado && !EstaAutenticado()))
        {
            return NotFound(new { message = "No se encontró el ejercicio solicitado." });
        }

        if (archivo.VideoTutorial is null || archivo.VideoTutorial.Length == 0)
        {
            return NotFound(new { message = "El ejercicio no tiene un video tutorial." });
        }

        Response.Headers.CacheControl = "private, max-age=300";
        return File(
            archivo.VideoTutorial,
            archivo.TipoContenidoVideo ?? "application/octet-stream",
            enableRangeProcessing: true);
    }

    // POST: api/ejercicios
    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxImagenBytes + MaxVideoBytes + 2 * 1024 * 1024)]
    public async Task<ActionResult<EjercicioResponse>> CrearEjercicio(
        [FromForm] CrearEjercicioRequest request,
        CancellationToken cancellationToken)
    {
        if (request.ImagenPreview is null)
        {
            return BadRequest(new { message = "Seleccioná una imagen de vista previa." });
        }

        if (request.VideoTutorial is null)
        {
            return BadRequest(new { message = "Seleccioná un video tutorial." });
        }

        var campos = ValidarCampos(request);
        if (campos.Error is not null)
        {
            return BadRequest(new { message = campos.Error });
        }

        if (await ExisteNombre(campos.Nombre!, null, cancellationToken))
        {
            return Conflict(new { message = "Ya existe un ejercicio con ese nombre." });
        }

        var duracionError = ValidarDuracion(request.DuracionVideoSegundos);
        if (duracionError is not null)
        {
            return BadRequest(new { message = duracionError });
        }

        var imagen = await LeerImagen(request.ImagenPreview, cancellationToken);
        if (imagen.Error is not null || imagen.Archivo is null)
        {
            return BadRequest(new { message = imagen.Error ?? "La imagen no es válida." });
        }

        var video = await LeerVideo(request.VideoTutorial, cancellationToken);
        if (video.Error is not null || video.Archivo is null)
        {
            return BadRequest(new { message = video.Error ?? "El video no es válido." });
        }

        var ejercicio = new Ejercicio
        {
            Nombre = campos.Nombre!,
            GrupoMuscular = campos.GrupoMuscular!,
            Descripcion = Limpiar(request.Descripcion),
            Estado = request.Estado,
            ImagenPreview = imagen.Archivo.Contenido,
            NombreArchivoImagen = imagen.Archivo.Nombre,
            TipoContenidoImagen = imagen.Archivo.TipoContenido,
            TamanoImagenBytes = imagen.Archivo.Contenido.LongLength,
            VideoTutorial = video.Archivo.Contenido,
            NombreArchivoVideo = video.Archivo.Nombre,
            TipoContenidoVideo = video.Archivo.TipoContenido,
            TamanoVideoBytes = video.Archivo.Contenido.LongLength,
            DuracionVideoSegundos = request.DuracionVideoSegundos,
            FechaRegistro = DateTime.UtcNow
        };

        _context.Ejercicios.Add(ejercicio);
        await _context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(
            nameof(ObtenerEjercicioPorId),
            new { id = ejercicio.IdEjercicio },
            Mapear(ejercicio));
    }

    // PUT: api/ejercicios/5
    [HttpPut("{id:int}")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxImagenBytes + MaxVideoBytes + 2 * 1024 * 1024)]
    public async Task<ActionResult<EjercicioResponse>> ActualizarEjercicio(
        int id,
        [FromForm] ActualizarEjercicioRequest request,
        CancellationToken cancellationToken)
    {
        var ejercicio = await _context.Ejercicios.SingleOrDefaultAsync(
            ejercicio => ejercicio.IdEjercicio == id,
            cancellationToken);

        if (ejercicio is null)
        {
            return NotFound(new { message = "No se encontró el ejercicio solicitado." });
        }

        var campos = ValidarCampos(request);
        if (campos.Error is not null)
        {
            return BadRequest(new { message = campos.Error });
        }

        if (await ExisteNombre(campos.Nombre!, id, cancellationToken))
        {
            return Conflict(new { message = "Ya existe otro ejercicio con ese nombre." });
        }

        Archivo? nuevaImagen = null;
        if (request.ImagenPreview is not null)
        {
            var imagen = await LeerImagen(request.ImagenPreview, cancellationToken);
            if (imagen.Error is not null || imagen.Archivo is null)
            {
                return BadRequest(new { message = imagen.Error ?? "La imagen no es válida." });
            }

            nuevaImagen = imagen.Archivo;
        }
        else if (ejercicio.ImagenPreview is null)
        {
            return BadRequest(new
            {
                message = "Este ejercicio todavía no tiene una imagen de vista previa. Seleccioná una para actualizarlo."
            });
        }

        Archivo? nuevoVideo = null;
        if (request.VideoTutorial is not null)
        {
            var duracionError = ValidarDuracion(request.DuracionVideoSegundos);
            if (duracionError is not null)
            {
                return BadRequest(new { message = duracionError });
            }

            var video = await LeerVideo(request.VideoTutorial, cancellationToken);
            if (video.Error is not null || video.Archivo is null)
            {
                return BadRequest(new { message = video.Error ?? "El video no es válido." });
            }

            nuevoVideo = video.Archivo;
        }
        else if (ejercicio.VideoTutorial is null)
        {
            return BadRequest(new
            {
                message = "Este ejercicio todavía no tiene un video tutorial. Seleccioná uno para actualizarlo."
            });
        }

        ejercicio.Nombre = campos.Nombre!;
        ejercicio.GrupoMuscular = campos.GrupoMuscular!;
        ejercicio.Descripcion = Limpiar(request.Descripcion);
        ejercicio.Estado = request.Estado;
        ejercicio.FechaActualizacion = DateTime.UtcNow;

        if (nuevaImagen is not null)
        {
            ejercicio.ImagenPreview = nuevaImagen.Contenido;
            ejercicio.NombreArchivoImagen = nuevaImagen.Nombre;
            ejercicio.TipoContenidoImagen = nuevaImagen.TipoContenido;
            ejercicio.TamanoImagenBytes = nuevaImagen.Contenido.LongLength;
        }

        if (nuevoVideo is not null)
        {
            ejercicio.VideoTutorial = nuevoVideo.Contenido;
            ejercicio.NombreArchivoVideo = nuevoVideo.Nombre;
            ejercicio.TipoContenidoVideo = nuevoVideo.TipoContenido;
            ejercicio.TamanoVideoBytes = nuevoVideo.Contenido.LongLength;
            ejercicio.DuracionVideoSegundos = request.DuracionVideoSegundos;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Ok(Mapear(ejercicio));
    }

    // DELETE: api/ejercicios/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> EliminarEjercicio(
        int id,
        CancellationToken cancellationToken)
    {
        var ejercicio = await _context.Ejercicios.SingleOrDefaultAsync(
            ejercicio => ejercicio.IdEjercicio == id,
            cancellationToken);

        if (ejercicio is null)
        {
            return NotFound(new { message = "No se encontró el ejercicio solicitado." });
        }

        _context.Ejercicios.Remove(ejercicio);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private bool EstaAutenticado() => User.Identity?.IsAuthenticated == true;

    private Task<bool> ExisteNombre(
        string nombre,
        int? idExcluir,
        CancellationToken cancellationToken)
    {
        return _context.Ejercicios.AnyAsync(
            ejercicio =>
                (!idExcluir.HasValue || ejercicio.IdEjercicio != idExcluir.Value) &&
                EF.Functions.ILike(ejercicio.Nombre, nombre),
            cancellationToken);
    }

    private static ValidacionCampos ValidarCampos(EjercicioFormularioRequest request)
    {
        var nombre = request.Nombre.Trim();
        if (nombre.Length < 2)
        {
            return new(null, null, "El nombre del ejercicio debe tener al menos 2 caracteres.");
        }

        var grupoMuscular = request.GrupoMuscular.Trim();
        if (grupoMuscular.Length < 2)
        {
            return new(null, null, "Seleccioná el grupo o la zona muscular.");
        }

        return new(nombre, grupoMuscular, null);
    }

    private static string? ValidarDuracion(int? duracionSegundos)
    {
        if (!duracionSegundos.HasValue || duracionSegundos.Value < 1)
        {
            return "No se pudo determinar la duración del video tutorial.";
        }

        if (duracionSegundos.Value > MaxDuracionVideoSegundos)
        {
            return $"El video tutorial no puede superar los {MaxDuracionVideoSegundos} segundos.";
        }

        return null;
    }

    private static async Task<ValidacionArchivo> LeerImagen(
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

        var contenido = await LeerContenido(imagen, cancellationToken);
        var tipoContenido = DetectarTipoImagen(contenido);
        if (tipoContenido is null)
        {
            return new(null, "La imagen debe ser JPG, PNG o WEBP y tener un contenido válido.");
        }

        return new(
            new Archivo(
                contenido,
                NombreArchivoSeguro(imagen.FileName, ExtensionImagen(tipoContenido), "preview"),
                tipoContenido),
            null);
    }

    private static async Task<ValidacionArchivo> LeerVideo(
        IFormFile video,
        CancellationToken cancellationToken)
    {
        if (video.Length == 0)
        {
            return new(null, "El video seleccionado está vacío.");
        }

        if (video.Length > MaxVideoBytes)
        {
            return new(null, "El video tutorial no puede superar los 30 MB.");
        }

        var contenido = await LeerContenido(video, cancellationToken);
        var tipoContenido = DetectarTipoVideo(contenido);
        if (tipoContenido is null)
        {
            return new(null, "El video debe ser MP4 o WEBM y tener un contenido válido.");
        }

        return new(
            new Archivo(
                contenido,
                NombreArchivoSeguro(video.FileName, ExtensionVideo(tipoContenido), "tutorial"),
                tipoContenido),
            null);
    }

    private static async Task<byte[]> LeerContenido(
        IFormFile archivo,
        CancellationToken cancellationToken)
    {
        await using var memoria = new MemoryStream();
        await archivo.CopyToAsync(memoria, cancellationToken);
        return memoria.ToArray();
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

    private static string? DetectarTipoVideo(byte[] contenido)
    {
        if (contenido.Length >= 12 &&
            contenido[4] == (byte)'f' && contenido[5] == (byte)'t' &&
            contenido[6] == (byte)'y' && contenido[7] == (byte)'p')
        {
            return "video/mp4";
        }

        if (contenido.Length >= 4 &&
            contenido[0] == 0x1A && contenido[1] == 0x45 &&
            contenido[2] == 0xDF && contenido[3] == 0xA3)
        {
            return "video/webm";
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

    private static string ExtensionVideo(string tipoContenido) => tipoContenido switch
    {
        "video/mp4" => ".mp4",
        "video/webm" => ".webm",
        _ => string.Empty
    };

    private static string NombreArchivoSeguro(
        string? nombreOriginal,
        string extension,
        string nombrePredeterminado)
    {
        var nombreBase = Path.GetFileNameWithoutExtension(
            Path.GetFileName(nombreOriginal ?? nombrePredeterminado));
        var caracteres = nombreBase
            .Select(caracter =>
                char.IsLetterOrDigit(caracter) || caracter is '-' or '_'
                    ? caracter
                    : '-')
            .ToArray();
        var nombreLimpio = new string(caracteres).Trim('-');

        if (string.IsNullOrWhiteSpace(nombreLimpio))
        {
            nombreLimpio = nombrePredeterminado;
        }

        if (nombreLimpio.Length > 120)
        {
            nombreLimpio = nombreLimpio[..120];
        }

        return $"{nombreLimpio}{extension}";
    }

    private static string? Limpiar(string? valor) =>
        string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();

    private static EjercicioResponse Mapear(Ejercicio ejercicio) => new()
    {
        IdEjercicio = ejercicio.IdEjercicio,
        Nombre = ejercicio.Nombre,
        GrupoMuscular = ejercicio.GrupoMuscular,
        Descripcion = ejercicio.Descripcion,
        Estado = ejercicio.Estado,
        TieneImagenPreview = ejercicio.ImagenPreview is { Length: > 0 },
        NombreArchivoImagen = ejercicio.NombreArchivoImagen,
        TipoContenidoImagen = ejercicio.TipoContenidoImagen,
        TamanoImagenBytes = ejercicio.TamanoImagenBytes,
        ImagenPreviewUrl = ejercicio.ImagenPreview is { Length: > 0 }
            ? $"/api/ejercicios/{ejercicio.IdEjercicio}/imagen"
            : null,
        TieneVideoTutorial = ejercicio.VideoTutorial is { Length: > 0 },
        NombreArchivoVideo = ejercicio.NombreArchivoVideo,
        TipoContenidoVideo = ejercicio.TipoContenidoVideo,
        TamanoVideoBytes = ejercicio.TamanoVideoBytes,
        DuracionVideoSegundos = ejercicio.DuracionVideoSegundos,
        VideoTutorialUrl = ejercicio.VideoTutorial is { Length: > 0 }
            ? $"/api/ejercicios/{ejercicio.IdEjercicio}/video"
            : null,
        FechaRegistro = ejercicio.FechaRegistro,
        FechaActualizacion = ejercicio.FechaActualizacion
    };

    private sealed record Archivo(byte[] Contenido, string Nombre, string TipoContenido);

    private sealed record ValidacionArchivo(Archivo? Archivo, string? Error);

    private sealed record ValidacionCampos(
        string? Nombre,
        string? GrupoMuscular,
        string? Error);
}
