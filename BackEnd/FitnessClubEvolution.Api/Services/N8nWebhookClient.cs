using System.Net.Http.Json;

namespace FitnessClubEvolution.Api.Services;

public interface IN8nWebhookClient
{
    Task<N8nWebhookResult> NotificarRutinaAsignada(
        RutinaAsignadaWebhook payload,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Despierta el workflow de rutina apenas el backend confirma el alta inicial
/// o un cambio de la rutina asignada. La notificación ya quedó guardada antes
/// de esta llamada, por lo que
/// una caída de n8n no revierte el alta ni pierde el envío pendiente.
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

    public async Task<N8nWebhookResult> NotificarRutinaAsignada(
        RutinaAsignadaWebhook payload,
        CancellationToken cancellationToken)
    {
        var webhookUrl = _configuration["Integrations:N8n:RoutineWebhookUrl"];
        if (!Uri.TryCreate(webhookUrl, UriKind.Absolute, out var uri))
        {
            _logger.LogWarning(
                "La rutina {NotificacionId} quedó pendiente porque no se configuró Integrations:N8n:RoutineWebhookUrl.",
                payload.IdNotificacion);
            return new(false, null, "No se configuró el webhook de rutina de n8n.");
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
                "La rutina {NotificacionId} quedó pendiente: {Error}",
                payload.IdNotificacion,
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
                "No se pudo despertar n8n para la rutina {NotificacionId}; permanece pendiente.",
                payload.IdNotificacion);
            return new(false, null, "No fue posible conectar con n8n.");
        }
    }
}

public sealed record RutinaAsignadaWebhook(
    int IdNotificacion,
    int IdCliente,
    string Telefono,
    string NombreCliente,
    string IdRutinaEsperada,
    string Tipo = "RutinaAsignada");

public sealed record N8nWebhookResult(
    bool Entregado,
    int? CodigoHttp,
    string? Error);
