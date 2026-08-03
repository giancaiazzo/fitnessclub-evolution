using System.ComponentModel.DataAnnotations;

namespace FitnessClubEvolution.Api.DTOs;

public sealed class CrearClienteRequest
{
    [Required, StringLength(60, MinimumLength = 2)]
    public string Nombre { get; set; } = string.Empty;

    [Required, StringLength(60, MinimumLength = 2)]
    public string Apellido { get; set; } = string.Empty;

    [Required, RegularExpression(@"^\d{6,12}$", ErrorMessage = "El documento debe contener entre 6 y 12 números.")]
    public string Documento { get; set; } = string.Empty;

    [Required, RegularExpression(@"^598\d{8}$", ErrorMessage = "El teléfono debe incluir 598 seguido de 8 números.")]
    public string Telefono { get; set; } = string.Empty;

    public DateOnly? FechaNacimiento { get; set; }

    [StringLength(150)]
    public string? Direccion { get; set; }

    [Required]
    [RegularExpression(
        @"^(adaptacion-hombre|adaptacion-mujer|rutina-hombre|rutina-mujer)$",
        ErrorMessage = "La rutina seleccionada no es válida.")]
    public string RutinaSeleccionada { get; set; } = string.Empty;
}

public sealed class ActualizarClienteRequest
{
    [Required, StringLength(60, MinimumLength = 2)]
    public string Nombre { get; set; } = string.Empty;

    [Required, StringLength(60, MinimumLength = 2)]
    public string Apellido { get; set; } = string.Empty;

    [Required, RegularExpression(@"^\d{6,12}$", ErrorMessage = "El documento debe contener entre 6 y 12 números.")]
    public string Documento { get; set; } = string.Empty;

    [Required, RegularExpression(@"^598\d{8}$", ErrorMessage = "El teléfono debe incluir 598 seguido de 8 números.")]
    public string Telefono { get; set; } = string.Empty;

    public DateOnly? FechaNacimiento { get; set; }

    [StringLength(150)]
    public string? Direccion { get; set; }

    [Required]
    public bool? Estado { get; set; }
}

public sealed class CambiarEstadoClienteRequest
{
    [Required]
    public bool? Estado { get; set; }
}

public class ClienteResponse
{
    public int IdCliente { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Documento { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public DateOnly? FechaNacimiento { get; set; }
    public string? Direccion { get; set; }
    public DateTime FechaRegistro { get; set; }
    public bool Estado { get; set; }
}

public sealed class ClienteDetalleResponse : ClienteResponse
{
    public int? Edad { get; set; }
}

public sealed class EstadoPagoClienteResponse
{
    public int IdCliente { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Documento { get; set; } = string.Empty;
    public bool ClienteActivo { get; set; }
    public DateTime? UltimaFechaPago { get; set; }
    public DateOnly? FechaInicio { get; set; }
    public DateOnly? FechaVencimiento { get; set; }
    public int? DiasRestantes { get; set; }
    public int DiasVencido { get; set; }
    public string EstadoCuota { get; set; } = "Sin pagos";
    public string? Servicio { get; set; }
}
