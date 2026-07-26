using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FitnessClubEvolution.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientesController : ControllerBase
    {
        // GET: api/clientes
        // Obtener todos los clientes
        [HttpGet]
        public IActionResult ObtenerClientes()
        {
            return Ok();
        }

        // GET: api/clientes/{id}
        // Obtener un cliente por ID
        [HttpGet("{id}")]
        public IActionResult ObtenerClientePorId(int id)
        {
            return Ok();
        }

        // POST: api/clientes
        // Crear un nuevo cliente
        [HttpPost]
        public IActionResult CrearCliente([FromBody] object cliente)
        {
            return Ok();
        }

        // PUT: api/clientes/{id}
        // Actualizar un cliente existente
        [HttpPut("{id}")]
        public IActionResult ActualizarCliente(int id, [FromBody] object cliente)
        {
            return Ok();
        }

        // DELETE: api/clientes/{id}
        // Eliminar cliente
        [HttpDelete("{id}")]
        public IActionResult EliminarCliente(int id)
        {
            return Ok();
        }

        // GET: api/clientes/buscar?texto=algo
        // Buscar clientes por texto
        [HttpGet("buscar")]
        public IActionResult BuscarClientes([FromQuery] string texto)
        {
            return Ok();
        }

        // PATCH: api/clientes/{id}/estado
        // Cambiar estado del cliente: activo/inactivo
        [HttpPatch("{id}/estado")]
        public IActionResult CambiarEstadoCliente(int id, [FromBody] object estado)
        {
            return Ok();
        }

        // GET: api/clientes/{id}/detalle
        // Obtener información detallada de un cliente
        [HttpGet("{id}/detalle")]
        public IActionResult ObtenerDetalleCliente(int id)
        {
            return Ok();
        }
    }
}

