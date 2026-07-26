using System.ComponentModel.DataAnnotations;

namespace FitnessClubEvolution.Api.Models
{
    public class Ejercicio
    {
        [Key]
        public int IdEjercicio { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string? FotoOVideo { get; set; }

        public string? GrupoMuscular { get; set; }

        public string? Descripcion { get; set; }

        public bool Estado { get; set; } = true;
    }
}
