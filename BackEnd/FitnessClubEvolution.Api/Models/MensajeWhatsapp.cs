using System.ComponentModel.DataAnnotations;

namespace FitnessClubEvolution.Api.Models;

/// <summary>
/// Registro mínimo de un evento de WhatsApp. Se conserva el identificador de
/// Meta para impedir reprocesamientos, pero no se almacena la conversación
/// completa ni información innecesaria para el negocio.
/// </summary>
public class MensajeWhatsapp
{
    [Key]
    public long IdMensajeWhatsapp { get; set; }

    [Required, StringLength(150)]
    public string IdMensajeMeta { get; set; } = string.Empty;

    [Required, StringLength(20)]
    public string Telefono { get; set; } = string.Empty;

    [Required, StringLength(20)]
    public string Direccion { get; set; } = "Entrante";

    [Required, StringLength(40)]
    public string Tipo { get; set; } = "Texto";

    [StringLength(500)]
    public string? Resumen { get; set; }

    [Required, StringLength(30)]
    public string EstadoProcesamiento { get; set; } = "Recibido";

    public int Intentos { get; set; }

    [StringLength(1000)]
    public string? UltimoError { get; set; }

    public DateTime FechaRecepcion { get; set; } = DateTime.UtcNow;

    public DateTime? FechaProcesamiento { get; set; }

    public int? IdCliente { get; set; }

    public Cliente? Cliente { get; set; }
}
