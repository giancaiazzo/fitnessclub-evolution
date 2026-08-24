using System.Net.Http.Json;

namespace FitnessClubEvolution.Api.Services;

public interface IN8nWebhookClient
{
    Task<N8nWebhookResult> EnviarRecuperacionContrasena(
        RecuperacionContrasenaWebhook payload,
        CancellationToken cancellationToken);
}

/// <summary>
/// Envía eventos del backend hacia workflows iniciados por Webhook. La lógica
/// de negocio ya fue validada antes de llegar aquí; n8n únicamente orquesta el
/// envío por WhatsApp.
/// </summary>
public sealed class N8nWebhookClient : IN8nWebhookClient
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<N8nWebhookClient> _logger;

    public N8nWebhookClient(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<N8nWebhookClient> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<N8nWebhookResult> EnviarRecuperacionContrasena(
        RecuperacionContrasenaWebhook payload,
        CancellationToken cancellationToken)
    {
        var webhookUrl = _configuration["Integrations:N8n:RecoveryWebhookUrl"];
        if (!Uri.TryCreate(webhookUrl, UriKind.Absolute, out var uri))
        {
            return new(false, null, "No se configuró el webhook de recuperación de n8n.");
        }

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, uri)
            {
                Content = JsonContent.Create(payload)
            };

            var apiKey = _configuration["Integrations:N8n:ApiKey"];
            if (!string.IsNullOrWhiteSpace(apiKey))
            {
                request.Headers.TryAddWithoutValidation("X-N8N-API-KEY", apiKey);
            }

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                return new(true, (int)response.StatusCode, null);
            }

            var error = $"n8n respondió HTTP {(int)response.StatusCode}.";
            _logger.LogWarning(
                "No se pudo entregar la solicitud {SolicitudId} a n8n: {Error}",
                payload.IdSolicitud,
                error);
            return new(false, (int)response.StatusCode, error);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return new(false, null, "La conexión con n8n agotó el tiempo de espera.");
        }
        catch (HttpRequestException exception)
        {
            _logger.LogWarning(
                exception,
                "No se pudo conectar con n8n para la solicitud {SolicitudId}.",
                payload.IdSolicitud);
            return new(false, null, "No fue posible conectar con n8n.");
        }
    }
}

public sealed record RecuperacionContrasenaWebhook(
    long IdSolicitud,
    string Telefono,
    string NombreUsuario,
    string Nombre,
    string Codigo,
    DateTime FechaExpiracionUtc,
    string Idioma = "es_UY");

public sealed record N8nWebhookResult(
    bool Entregado,
    int? CodigoHttp,
    string? Error);
