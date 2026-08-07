using System.ComponentModel.DataAnnotations;

namespace FitnessClubEvolution.Api.Models
{
    public class Cuota
    {
        [Key]
        public int IdCuota { get; set; }

        public int IdCliente { get; set; }

        public int? IdEntrenador { get; set; }

        public DateTime FechaPago { get; set; } = DateTime.UtcNow;

        public DateOnly FechaInicio { get; set; }

        public DateOnly FechaVencimiento { get; set; }

        public decimal Monto { get; set; }

        public string MetodoPago { get; set; } = string.Empty;

        public string EstadoPago { get; set; } = "Confirmado";

        public string? Observaciones { get; set; }

        public Cliente Cliente { get; set; } = null!;

        public Entrenador? Entrenador { get; set; }
    }
}
