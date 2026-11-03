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

        public string? CorreoElectronico { get; set; }

        public string? CorreoElectronicoNormalizado { get; set; }

        public string NombreUsuario { get; set; } = string.Empty;

        public string NombreUsuarioNormalizado { get; set; } = string.Empty;

        // Los registros anteriores pueden conservar temporalmente la contraseña
        // antigua. En el primer inicio de sesión correcto se migra a hash y este
        // campo queda en null; nunca se usa para cuentas nuevas.
        public string? Contrasena { get; set; }

        public string? ContrasenaHash { get; set; }

        public string Rol { get; set; } = "Administrador";

        public bool Estado { get; set; } = true;

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? UltimoAcceso { get; set; }

        public ICollection<Cuota> CuotasRegistradas { get; set; } = new List<Cuota>();

        public ICollection<SolicitudRecuperacion> SolicitudesRecuperacion { get; set; } =
            new List<SolicitudRecuperacion>();
    }
}
