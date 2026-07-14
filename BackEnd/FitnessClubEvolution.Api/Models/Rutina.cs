using System.ComponentModel.DataAnnotations;

namespace FitnessClubEvolution.Api.Models
{
    public class Rutina
    {
        [Key]
        public int IdRutina { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string? Descripcion { get; set; }

        public string NombreArchivoPdf { get; set; } = string.Empty;

        public string RutaPdf { get; set; } = string.Empty;

        public DateTime FechaCarga { get; set; } = DateTime.Now;


    }
}
