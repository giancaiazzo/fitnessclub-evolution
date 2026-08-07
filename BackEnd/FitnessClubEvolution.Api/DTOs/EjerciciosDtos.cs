using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace FitnessClubEvolution.Api.DTOs;

public class EjercicioFormularioRequest
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string Nombre { get; set; } = string.Empty;

    [Required, StringLength(60, MinimumLength = 2)]
    public string GrupoMuscular { get; set; } = string.Empty;

    [StringLength(600)]
    public string? Descripcion { get; set; }

    public bool Estado { get; set; } = true;

    public IFormFile? ImagenPreview { get; set; }

    public IFormFile? VideoTutorial { get; set; }

    public int? DuracionVideoSegundos { get; set; }
}

public sealed class CrearEjercicioRequest : EjercicioFormularioRequest
{
}

public sealed class ActualizarEjercicioRequest : EjercicioFormularioRequest
{
}

public sealed class EjercicioResponse
{
    public int IdEjercicio { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string GrupoMuscular { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool Estado { get; set; }
    public bool TieneImagenPreview { get; set; }
    public string? NombreArchivoImagen { get; set; }
    public string? TipoContenidoImagen { get; set; }
    public long? TamanoImagenBytes { get; set; }
    public string? ImagenPreviewUrl { get; set; }
    public bool TieneVideoTutorial { get; set; }
    public string? NombreArchivoVideo { get; set; }
    public string? TipoContenidoVideo { get; set; }
    public long? TamanoVideoBytes { get; set; }
    public int? DuracionVideoSegundos { get; set; }
    public string? VideoTutorialUrl { get; set; }
    public DateTime FechaRegistro { get; set; }
    public DateTime? FechaActualizacion { get; set; }
}
