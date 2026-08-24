using System.ComponentModel.DataAnnotations;

namespace FitnessClubEvolution.Api.DTOs;

public sealed class ReservarMensajeWhatsappRequest
{
    [Required, StringLength(150)]
    public string IdMensajeMeta { get; set; } = string.Empty;

    [Required, StringLength(20)]
    public string Telefono { get; set; } = string.Empty;

    [Required, StringLength(40)]
    public string Tipo { get; set; } = "Texto";

    [StringLength(500)]
    public string? Resumen { get; set; }
}

public sealed class ReservarMensajeWhatsappResponse
{
    public bool Procesar { get; set; }
    public bool Duplicado { get; set; }
    public long? IdMensajeWhatsapp { get; set; }
    public int? IdCliente { get; set; }
    public int? IdEntrenador { get; set; }
    public string TelefonoNormalizado { get; set; } = string.Empty;
    public string? TipoAcceso { get; set; }
    public string? Nombre { get; set; }
    public string? Apellido { get; set; }
    public string? EstadoCliente { get; set; }
    public bool AceptaWhatsApp { get; set; }
    public EstadoCuotaBotResponse? Cuota { get; set; }
    public RutinaBotResponse? Rutina { get; set; }
}

public sealed class ResultadoMensajeWhatsappRequest
{
    [Range(1, long.MaxValue)]
    public long IdMensajeWhatsapp { get; set; }

    [Required, StringLength(30)]
    public string Estado { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Error { get; set; }
}

public sealed class ClienteBotResponse
{
    public bool Encontrado { get; set; }
    public bool Ambiguo { get; set; }
    public bool PermiteDatosPrivados { get; set; }
    public int? IdCliente { get; set; }
    public string? Nombre { get; set; }
    public string? Apellido { get; set; }
    public string TelefonoNormalizado { get; set; } = string.Empty;
    public string EstadoCliente { get; set; } = "NoRegistrado";
    public bool AceptaWhatsApp { get; set; }
    public EstadoCuotaBotResponse? Cuota { get; set; }
    public RutinaBotResponse? Rutina { get; set; }
}

public sealed class EstadoCuotaBotResponse
{
    public string Estado { get; set; } = "Vigente";
    public DateOnly FechaInicio { get; set; }
    public DateOnly FechaVencimiento { get; set; }
    public int DiasRestantes { get; set; }
    public int DiasVencido { get; set; }
}

public sealed class RutinaBotResponse
{
    public int IdRutina { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string NombreArchivoPdf { get; set; } = string.Empty;
    public int? CantidadPaginas { get; set; }
    public long? TamanoBytes { get; set; }
    public string PdfEndpoint { get; set; } = string.Empty;
}

public sealed class NotificacionN8nResponse
{
    public int IdNotificacion { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public string ClaveIdempotencia { get; set; } = string.Empty;
    public string? Referencia { get; set; }
    public int IdCliente { get; set; }
    public string NombreCliente { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public DateOnly? FechaVencimiento { get; set; }
    public DateTime FechaProgramadaUtc { get; set; }
    public string Estado { get; set; } = string.Empty;
}

public sealed class ResultadoNotificacionRequest
{
    [Range(1, int.MaxValue)]
    public int IdNotificacion { get; set; }

    [Required, StringLength(30)]
    public string Estado { get; set; } = string.Empty;

    [StringLength(150)]
    public string? IdMensajeExterno { get; set; }

    [StringLength(1000)]
    public string? Error { get; set; }
}

public sealed class ActualizarConsentimientoWhatsappRequest
{
    [Required, StringLength(20)]
    public string Telefono { get; set; } = string.Empty;

    public bool Acepta { get; set; }
}

public sealed class ActualizarConsentimientoWhatsappResponse
{
    public int IdCliente { get; set; }
    public string TelefonoNormalizado { get; set; } = string.Empty;
    public bool AceptaWhatsApp { get; set; }
    public DateTime? FechaConsentimientoUtc { get; set; }
    public DateTime? FechaBajaUtc { get; set; }
}
