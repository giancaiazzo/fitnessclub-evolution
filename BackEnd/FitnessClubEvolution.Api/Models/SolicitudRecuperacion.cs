using System.ComponentModel.DataAnnotations;

namespace FitnessClubEvolution.Api.Models;

/// <summary>
/// Código temporal para recuperar el acceso al módulo de gestión. El código
/// nunca se guarda en texto plano: solamente se persiste el hash generado por
/// el PasswordHasher de ASP.NET Core.
/// </summary>
public class SolicitudRecuperacion
{
    [Key]
    public long IdSolicitudRecuperacion { get; set; }

    public int IdEntrenador { get; set; }

    [Required]
    public string CodigoHash { get; set; } = string.Empty;

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public DateTime FechaExpiracion { get; set; }

    public DateTime? FechaUso { get; set; }

    public int Intentos { get; set; }

    public int MaxIntentos { get; set; } = 5;

    [Required, StringLength(20)]
    public string Estado { get; set; } = "Pendiente";

    [StringLength(64)]
    public string? IpSolicitud { get; set; }

    public Entrenador Entrenador { get; set; } = null!;
}
