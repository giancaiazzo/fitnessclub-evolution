using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace FitnessClubEvolution.Api.Security;

/// <summary>
/// Protege los endpoints internos que consume n8n. La clave se obtiene de la
/// configuración del servidor y se compara en tiempo constante; nunca debe
/// formar parte de una URL, del repositorio ni de la respuesta HTTP.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class N8nApiKeyAttribute : Attribute, IAsyncAuthorizationFilter
{
    public const string HeaderName = "X-N8N-API-KEY";

    public Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var configuration = context.HttpContext.RequestServices
            .GetRequiredService<IConfiguration>();
        var expected = configuration["Integrations:N8n:ApiKey"];

        if (string.IsNullOrWhiteSpace(expected))
        {
            context.Result = new ObjectResult(new
            {
                message = "La integración interna con n8n no está configurada."
            })
            {
                StatusCode = StatusCodes.Status503ServiceUnavailable
            };
            return Task.CompletedTask;
        }

        var supplied = context.HttpContext.Request.Headers[HeaderName].ToString();
        if (string.IsNullOrWhiteSpace(supplied) || !EqualsInConstantTime(expected, supplied))
        {
            context.Result = new UnauthorizedObjectResult(new
            {
                message = "Credencial de integración inválida."
            });
        }

        return Task.CompletedTask;
    }

    private static bool EqualsInConstantTime(string expected, string supplied)
    {
        var expectedHash = SHA256.HashData(Encoding.UTF8.GetBytes(expected));
        var suppliedHash = SHA256.HashData(Encoding.UTF8.GetBytes(supplied));
        return CryptographicOperations.FixedTimeEquals(expectedHash, suppliedHash);
    }
}
