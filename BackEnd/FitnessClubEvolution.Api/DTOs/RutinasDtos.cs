using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace FitnessClubEvolution.Api.DTOs;

public class RutinaFormularioRequest
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Descripcion { get; set; }

    public IFormFile? Pdf { get; set; }
}

public sealed class CrearRutinaRequest : RutinaFormularioRequest
{
}

public sealed class ActualizarRutinaRequest : RutinaFormularioRequest
{
}

public sealed class RutinaResponse
{
    public int IdRutina { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string NombreArchivoPdf { get; set; } = string.Empty;
    public int? CantidadPaginas { get; set; }
    public long? TamanoBytes { get; set; }
    public DateTime FechaCarga { get; set; }
    public bool TienePdf { get; set; }
    public string? PdfUrl { get; set; }
}
