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

        // Evita que un reintento del workflow genere dos avisos iguales.
        // PostgreSQL permite varios null en un índice único, por lo que las
        // notificaciones históricas siguen siendo compatibles.
        public string? ClaveIdempotencia { get; set; }

        public string Canal { get; set; } = "WhatsApp";

        public string? Referencia { get; set; }

        public string? IdMensajeExterno { get; set; }

        public int Intentos { get; set; }

        public string? UltimoError { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaActualizacion { get; set; }

        public DateTime? FechaEntrega { get; set; }

        public DateTime? FechaLectura { get; set; }

        public Cliente Cliente { get; set; } = null!;
    }
}
