using System.ComponentModel.DataAnnotations;

namespace FitnessClubEvolution.Api.Models
{
    public class Notificacion
    {
        [Key]
        public int IdNotificacion { get; set; }

        public int IdCliente { get; set; }

        public string Tipo { get; set; } = string.Empty;

        public string Mensaje { get; set; } = string.Empty;

        public DateTime FechaProgramada { get; set; }

        public DateTime? FechaEnvio { get; set; }

        public string Estado { get; set; } = "Pendiente";

        public Cliente Cliente { get; set; } = null!;
    }
}
