using System.ComponentModel.DataAnnotations;

namespace FitnessClubEvolution.Api.Models
{
    public class Cuota
    {
        [Key]
        public int IdCuota { get; set; }

        public int IdCliente { get; set; }

        public int IdServicio { get; set; }

        public int? IdEntrenador { get; set; }

        public DateTime FechaPago { get; set; } = DateTime.Now;

        public decimal Monto { get; set; }

        public string? MetodoPago { get; set; }

        public string? Observaciones { get; set; }

        public Cliente Cliente { get; set; } = null!;

        public Servicio Servicio { get; set; } = null!;

        public Entrenador? Entrenador { get; set; }
    }
}
