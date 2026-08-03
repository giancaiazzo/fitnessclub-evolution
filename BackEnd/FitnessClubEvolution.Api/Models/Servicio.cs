using System.ComponentModel.DataAnnotations;

namespace FitnessClubEvolution.Api.Models;

public class Servicio
{
    [Key]
    public int IdServicio { get; set; }

    [Required, StringLength(80)]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Descripcion { get; set; }

    public decimal Precio { get; set; }

    [StringLength(50)]
    public string? Duracion { get; set; }

    // La imagen se guarda en PostgreSQL como bytea. El listado solamente
    // devuelve sus metadatos y la descarga por un endpoint dedicado.
    public byte[]? Imagen { get; set; }

    [StringLength(255)]
    public string? NombreArchivoImagen { get; set; }

    [StringLength(50)]
    public string? TipoContenidoImagen { get; set; }

    public ICollection<Cuota> Cuotas { get; set; } = new List<Cuota>();
}
