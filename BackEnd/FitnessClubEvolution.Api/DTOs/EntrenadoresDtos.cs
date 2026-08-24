using System.ComponentModel.DataAnnotations;

namespace FitnessClubEvolution.Api.DTOs;

public sealed class CrearEntrenadorRequest
{
    [Required, StringLength(60, MinimumLength = 2)]
    public string Nombre { get; set; } = string.Empty;

    [Required, StringLength(60, MinimumLength = 2)]
    public string Apellido { get; set; } = string.Empty;

    [Required, RegularExpression(@"^598\d{8}$", ErrorMessage = "El teléfono debe incluir 598 seguido de 8 números.")]
    public string Telefono { get; set; } = string.Empty;

    [Required, StringLength(60, MinimumLength = 3)]
    [RegularExpression(@"^[A-Za-z0-9._-]+$", ErrorMessage = "El usuario solo puede contener letras, números, punto, guion y guion bajo.")]
    public string NombreUsuario { get; set; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 8)]
    public string Contrasena { get; set; } = string.Empty;

    [Required, RegularExpression("^(Administrador|Entrenador)$")]
    public string Rol { get; set; } = "Entrenador";
}

public sealed class EntrenadorResponse
{
    public int IdEntrenador { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string NombreUsuario { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public bool Estado { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? UltimoAcceso { get; set; }
}
