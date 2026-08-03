using System.ComponentModel.DataAnnotations;

namespace FitnessClubEvolution.Api.DTOs;

public sealed class RegistrarPagoRequest
{
    [Range(1, int.MaxValue)]
    public int IdCliente { get; set; }

    [Range(1, int.MaxValue)]
    public int IdServicio { get; set; }

    [Range(1, int.MaxValue)]
    public int? IdEntrenador { get; set; }

    [Range(typeof(decimal), "0.01", "9999999999")]
    public decimal Monto { get; set; }

    [Required, StringLength(30, MinimumLength = 2)]
    public string MetodoPago { get; set; } = string.Empty;

    [StringLength(300)]
    public string? Observaciones { get; set; }
}

public sealed class PagoResponse
{
    public int IdCuota { get; set; }
    public int IdCliente { get; set; }
    public string Cliente { get; set; } = string.Empty;
    public int IdServicio { get; set; }
    public string Servicio { get; set; } = string.Empty;
    public int? IdEntrenador { get; set; }
    public string? Entrenador { get; set; }
    public DateTime FechaPago { get; set; }
    public DateOnly FechaInicio { get; set; }
    public DateOnly FechaVencimiento { get; set; }
    public decimal Monto { get; set; }
    public string MetodoPago { get; set; } = string.Empty;
    public string EstadoPago { get; set; } = string.Empty;
    public string? Observaciones { get; set; }
}

public sealed class RegistrarPagoResponse
{
    public string Message { get; set; } = "Pago registrado correctamente.";
    public PagoResponse Pago { get; set; } = new();
    public EstadoPagoClienteResponse EstadoCliente { get; set; } = new();
}

public sealed class EntrenadorPagoResponse
{
    public int IdEntrenador { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
}
