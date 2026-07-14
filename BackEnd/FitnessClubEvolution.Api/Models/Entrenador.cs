using System.ComponentModel.DataAnnotations;

namespace FitnessClubEvolution.Api.Models
{
    public class Entrenador
    {
        [Key]
        public int IdEntrenador { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string Apellido { get; set; } = string.Empty;

        public string Telefono { get; set; } = string.Empty;

        public string Contrasena { get; set; } = string.Empty;

        public ICollection<Cuota> CuotasRegistradas { get; set; } = new List<Cuota>();

        
    }
}
