using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace FitnessClubEvolution.Api.DTOs;

public class ServicioFormularioRequest
{
    [Required, StringLength(80, MinimumLength = 2)]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Descripcion { get; set; }

    [Range(typeof(decimal), "0.01", "9999999999")]
    public decimal Precio { get; set; }

    [StringLength(50)]
    public string? Duracion { get; set; }

    public IFormFile? Imagen { get; set; }
}

public sealed class CrearServicioRequest : ServicioFormularioRequest
{
}

public sealed class ActualizarServicioRequest : ServicioFormularioRequest
{
    public bool EliminarImagen { get; set; }
}

public sealed class ServicioResponse
{
    public int IdServicio { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal Precio { get; set; }
    public string? Duracion { get; set; }
    public bool TieneImagen { get; set; }
    public string? NombreArchivoImagen { get; set; }
    public string? TipoContenidoImagen { get; set; }
    public string? ImagenUrl { get; set; }
}
