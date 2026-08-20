using System.ComponentModel.DataAnnotations;

namespace FitnessClubEvolution.Api.Models
{
    
    public class Cliente
    {
        [Key]
        public int IdCliente { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string Apellido { get; set; } = string.Empty;

        public string Documento { get; set; } = string.Empty;

        public string Telefono { get; set; } = string.Empty;

        public DateOnly? FechaNacimiento { get; set; }

        public string? Direccion { get; set; }

        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

        public bool Estado { get; set; } = true;

        // El consentimiento es independiente del estado del cliente. Un cliente
        // puede seguir activo en el gimnasio y haber solicitado no recibir
        // comunicaciones proactivas por WhatsApp.
        public bool AceptaWhatsApp { get; set; }

        public DateTime? FechaConsentimientoWhatsApp { get; set; }

        public DateTime? FechaBajaWhatsApp { get; set; }

        // Cada cliente mantiene exactamente una rutina actual. Varias personas
        // pueden compartir la misma rutina, por eso la clave foránea vive aquí.
        public int IdRutina { get; set; }

        public Rutina Rutina { get; set; } = null!;

        public ICollection<Cuota> Cuotas { get; set; } = new List<Cuota>();

        public ICollection<Notificacion> Notificaciones { get; set; } = new List<Notificacion>();

        public ICollection<MensajeWhatsapp> MensajesWhatsapp { get; set; } = new List<MensajeWhatsapp>();
    }
}
