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

        public DateTime? FechaNacimiento { get; set; }

        public string? Direccion { get; set; }

        public DateTime FechaRegistro { get; set; } = DateTime.Now;

        public bool Estado { get; set; } = true;
    }
}
