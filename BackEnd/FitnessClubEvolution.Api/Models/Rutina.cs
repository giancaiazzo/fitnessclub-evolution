using System.ComponentModel.DataAnnotations;

namespace FitnessClubEvolution.Api.Models;

public class Rutina
{
    [Key]
    public int IdRutina { get; set; }

    [Required, StringLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Descripcion { get; set; }

    [Required, StringLength(255)]
    public string NombreArchivoPdf { get; set; } = string.Empty;

    [StringLength(100)]
    public string? TipoContenidoPdf { get; set; }

    // Nullable para poder conservar registros creados antes de esta
    // implementación. Toda rutina nueva sí requiere un PDF válido.
    public byte[]? ContenidoPdf { get; set; }

    public int? CantidadPaginas { get; set; }

    public long? TamanoBytes { get; set; }

    public DateTime FechaCarga { get; set; } = DateTime.UtcNow;
}
