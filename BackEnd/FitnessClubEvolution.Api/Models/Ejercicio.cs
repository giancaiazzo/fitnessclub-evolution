using System.ComponentModel.DataAnnotations;

namespace FitnessClubEvolution.Api.Models;

public class Ejercicio
{
    [Key] 
    public int IdEjercicio { get; set; }

    [Required]
    public string Nombre { get; set; } = string.Empty;

    [Required]
    public string GrupoMuscular { get; set; } = string.Empty;

    public string? Descripcion { get; set; }

    public bool Estado { get; set; } = true;

    // Se conserva únicamente para no perder referencias multimedia de
    // registros anteriores. Las altas nuevas utilizan los campos separados.
    public string? FotoOVideo { get; set; }

    // La vista previa y el tutorial se almacenan en PostgreSQL como bytea.
    // Los endpoints de listado solo exponen metadatos y URLs de reproducción.
    public byte[]? ImagenPreview { get; set; }

    public string? NombreArchivoImagen { get; set; }

    public string? TipoContenidoImagen { get; set; }

    public long? TamanoImagenBytes { get; set; }

    public byte[]? VideoTutorial { get; set; }

    public string? NombreArchivoVideo { get; set; }

    public string? TipoContenidoVideo { get; set; }

    public long? TamanoVideoBytes { get; set; }

    public int? DuracionVideoSegundos { get; set; }

    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    public DateTime? FechaActualizacion { get; set; }
}
