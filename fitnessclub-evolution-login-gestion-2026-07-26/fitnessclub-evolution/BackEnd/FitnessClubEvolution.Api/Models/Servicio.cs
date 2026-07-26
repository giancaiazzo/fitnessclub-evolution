using System.ComponentModel.DataAnnotations;

namespace FitnessClubEvolution.Api.Models
{
    public class Servicio
    {
        [Key]
        public int IdServicio { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string? Descripcion { get; set; }

        public decimal Precio { get; set; }

        public string? Duracion { get; set; }

        public string? Foto { get; set; }

        
    }
}
