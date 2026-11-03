using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;

namespace FitnessClubEvolution.Api.Services;

public sealed class HikvisionOptions
{
    public bool Enabled { get; set; }
    public string BaseUrl { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool AllowInvalidCertificate { get; set; }
    public int TimeoutSeconds { get; set; } = 10;
}

public interface IHikvisionAccessService
{
    Task<HikvisionDeviceResult> ProbarConexion(CancellationToken cancellationToken);

    Task<HikvisionAccessResult> SincronizarAcceso(
        string employeeNo,
        bool habilitar,
        DateOnly fechaVencimiento,
        CancellationToken cancellationToken);
}

/// <summary>
/// Cliente mínimo de ISAPI para consultar el controlador y modificar únicamente
/// la vigencia de una persona ya enrolada. Las caras, huellas y tarjetas siguen
/// administrándose en el propio Hikvision.
/// </summary>
public sealed class HikvisionAccessService : IHikvisionAccessService
{
    private const string DeviceInfoPath = "/ISAPI/System/deviceInfo";
    private const string SearchUserPath = "/ISAPI/AccessControl/UserInfo/Search?format=json";
    private const string ModifyUserPath = "/ISAPI/AccessControl/UserInfo/Modify?format=json";
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly HttpClient _httpClient;
    private readonly HikvisionOptions _options;
    private readonly ILogger<HikvisionAccessService> _logger;

    public HikvisionAccessService(
        HttpClient httpClient,
        IOptions<HikvisionOptions> options,
        ILogger<HikvisionAccessService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<HikvisionDeviceResult> ProbarConexion(
        CancellationToken cancellationToken)
    {
        if (!TryGetBaseUri(out var baseUri, out var configurationError))
        {
            return new HikvisionDeviceResult(false, null, null, configurationError);
        }

        try
        {
            using var response = await _httpClient.GetAsync(
                new Uri(baseUri, DeviceInfoPath),
                cancellationToken);
            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return new HikvisionDeviceResult(
                    false,
                    null,
                    null,
                    BuildHttpError(response.StatusCode, content));
            }

            return new HikvisionDeviceResult(
                true,
                ExtractXmlValue(content, "model"),
                ExtractXmlValue(content, "firmwareVersion"),
                null);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return new HikvisionDeviceResult(
                false,
                null,
                null,
                "Hikvision no respondió dentro del tiempo esperado.");
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(exception, "No se pudo consultar el controlador Hikvision.");
            return new HikvisionDeviceResult(false, null, null, FriendlyTransportError(exception));
        }
    }

    public async Task<HikvisionAccessResult> SincronizarAcceso(
        string employeeNo,
        bool habilitar,
        DateOnly fechaVencimiento,
        CancellationToken cancellationToken)
    {
        var normalizedEmployeeNo = employeeNo.Trim();
        if (normalizedEmployeeNo.Length is < 1 or > 32)
        {
            return HikvisionAccessResult.Failure(
                habilitar,
                fechaVencimiento,
                "El código Hikvision debe contener entre 1 y 32 caracteres.");
        }

        if (!TryGetBaseUri(out var baseUri, out var configurationError))
        {
            return HikvisionAccessResult.Failure(
                habilitar,
                fechaVencimiento,
                configurationError!);
        }

        try
        {
            var user = await FindUser(baseUri, normalizedEmployeeNo, cancellationToken);
            if (!user.Success)
            {
                return HikvisionAccessResult.Failure(
                    habilitar,
                    fechaVencimiento,
                    user.Error!);
            }

            if (user.User is null)
            {
                return HikvisionAccessResult.Failure(
                    habilitar,
                    fechaVencimiento,
                    $"No existe una persona con el código Hikvision {normalizedEmployeeNo}.");
            }

            var today = FechaGimnasio.Hoy();
            var beginTime = habilitar
                ? today.ToString("yyyy-MM-dd") + "T00:00:00"
                : user.User.Valid?.BeginTime ?? today.ToString("yyyy-MM-dd") + "T00:00:00";
            var endTime = habilitar
                ? fechaVencimiento.ToString("yyyy-MM-dd") + "T23:59:59"
                : user.User.Valid?.EndTime ?? today.ToString("yyyy-MM-dd") + "T23:59:59";

            var request = new HikvisionModifyUserRequest
            {
                UserInfo = new HikvisionModifyUserInfo
                {
                    EmployeeNo = normalizedEmployeeNo,
                    Valid = new HikvisionValid
                    {
                        Enable = habilitar,
                        BeginTime = beginTime,
                        EndTime = endTime,
                        TimeType = "local"
                    }
                }
            };

            using var requestContent = JsonContent.Create(request, options: JsonOptions);
            using var response = await _httpClient.PutAsync(
                new Uri(baseUri, ModifyUserPath),
                requestContent,
                cancellationToken);
            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            if (!response.IsSuccessStatusCode || !IsSuccessfulIsapiResponse(content))
            {
                return HikvisionAccessResult.Failure(
                    habilitar,
                    fechaVencimiento,
                    BuildHttpError(response.StatusCode, content));
            }

            return HikvisionAccessResult.Successful(habilitar, fechaVencimiento);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return HikvisionAccessResult.Failure(
                habilitar,
                fechaVencimiento,
                "Hikvision no respondió dentro del tiempo esperado.");
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(
                exception,
                "Falló la sincronización Hikvision del employeeNo {EmployeeNo}.",
                normalizedEmployeeNo);
            return HikvisionAccessResult.Failure(
                habilitar,
                fechaVencimiento,
                FriendlyTransportError(exception));
        }
    }

    private async Task<HikvisionUserSearchResult> FindUser(
        Uri baseUri,
        string employeeNo,
        CancellationToken cancellationToken)
    {
        var request = new HikvisionSearchUserRequest
        {
            UserInfoSearchCond = new HikvisionSearchCondition
            {
                SearchId = $"fce-{Guid.NewGuid():N}",
                SearchResultPosition = 0,
                MaxResults = 2,
                EmployeeNoList = [new HikvisionEmployeeNumber { EmployeeNo = employeeNo }]
            }
        };

        using var requestContent = JsonContent.Create(request, options: JsonOptions);
        using var response = await _httpClient.PostAsync(
            new Uri(baseUri, SearchUserPath),
            requestContent,
            cancellationToken);
        var content = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode || !IsSuccessfulIsapiResponse(content))
        {
            return new HikvisionUserSearchResult(
                false,
                null,
                BuildHttpError(response.StatusCode, content));
        }

        HikvisionSearchUserResponse? searchResponse;
        try
        {
            searchResponse = JsonSerializer.Deserialize<HikvisionSearchUserResponse>(
                content,
                JsonOptions);
        }
        catch (JsonException)
        {
            return new HikvisionUserSearchResult(
                false,
                null,
                "Hikvision devolvió una respuesta de búsqueda no válida.");
        }

        var users = searchResponse?.UserInfoSearch?.UserInfo ?? [];
        var matches = users
            .Where(user => string.Equals(
                user.EmployeeNo,
                employeeNo,
                StringComparison.OrdinalIgnoreCase))
            .Take(2)
            .ToList();

        if (matches.Count > 1)
        {
            return new HikvisionUserSearchResult(
                false,
                null,
                $"El código Hikvision {employeeNo} devolvió más de una persona.");
        }

        return new HikvisionUserSearchResult(true, matches.SingleOrDefault(), null);
    }

    private bool TryGetBaseUri(out Uri baseUri, out string? error)
    {
        baseUri = null!;
        error = null;

        if (!_options.Enabled)
        {
            error = "La integración Hikvision está deshabilitada.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(_options.Username) ||
            string.IsNullOrWhiteSpace(_options.Password))
        {
            error = "Faltan las credenciales Hikvision en el servidor.";
            return false;
        }

        if (!Uri.TryCreate(_options.BaseUrl.TrimEnd('/'), UriKind.Absolute, out baseUri) ||
            baseUri.Scheme != Uri.UriSchemeHttps)
        {
            error = "La URL de Hikvision debe ser una dirección HTTPS absoluta.";
            return false;
        }

        return true;
    }

    private static bool IsSuccessfulIsapiResponse(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return true;
        }

        try
        {
            using var document = JsonDocument.Parse(content);
            var root = document.RootElement;
            if (root.TryGetProperty("ResponseStatus", out var nested))
            {
                root = nested;
            }

            if (root.TryGetProperty("statusCode", out var statusCode))
            {
                return statusCode.ValueKind switch
                {
                    JsonValueKind.Number => statusCode.TryGetInt32(out var value) && value == 1,
                    JsonValueKind.String => statusCode.GetString() == "1",
                    _ => false
                };
            }

            if (root.TryGetProperty("statusString", out var statusString))
            {
                return string.Equals(
                    statusString.GetString(),
                    "OK",
                    StringComparison.OrdinalIgnoreCase);
            }

            return true;
        }
        catch (JsonException)
        {
            // Algunos firmwares contestan XML aun solicitando format=json.
            return content.Contains("<statusCode>1</statusCode>", StringComparison.OrdinalIgnoreCase) ||
                content.Contains("<statusString>OK</statusString>", StringComparison.OrdinalIgnoreCase);
        }
    }

    private static string BuildHttpError(HttpStatusCode statusCode, string content)
    {
        var detail = ExtractIsapiError(content);
        return string.IsNullOrWhiteSpace(detail)
            ? $"Hikvision respondió HTTP {(int)statusCode}."
            : $"Hikvision respondió HTTP {(int)statusCode}: {detail}";
    }

    private static string? ExtractIsapiError(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(content);
            var root = document.RootElement;
            if (root.TryGetProperty("ResponseStatus", out var nested))
            {
                root = nested;
            }

            foreach (var name in new[] { "subStatusCode", "statusString", "errorMsg" })
            {
                if (root.TryGetProperty(name, out var value) &&
                    value.ValueKind == JsonValueKind.String &&
                    !string.IsNullOrWhiteSpace(value.GetString()))
                {
                    return Limit(value.GetString()!, 300);
                }
            }
        }
        catch (JsonException)
        {
            foreach (var element in new[] { "subStatusCode", "statusString", "errorMsg" })
            {
                var value = ExtractXmlValue(content, element);
                if (!string.IsNullOrWhiteSpace(value))
                {
                    return Limit(value, 300);
                }
            }
        }

        return null;
    }

    private static string? ExtractXmlValue(string content, string element)
    {
        var startToken = $"<{element}>";
        var endToken = $"</{element}>";
        var start = content.IndexOf(startToken, StringComparison.OrdinalIgnoreCase);
        if (start < 0)
        {
            return null;
        }

        start += startToken.Length;
        var end = content.IndexOf(endToken, start, StringComparison.OrdinalIgnoreCase);
        return end < 0 ? null : WebUtility.HtmlDecode(content[start..end].Trim());
    }

    private static string FriendlyTransportError(Exception exception) => exception switch
    {
        TaskCanceledException => "Hikvision no respondió dentro del tiempo esperado.",
        HttpRequestException => "No se pudo establecer conexión con Hikvision.",
        _ => "No se pudo completar la sincronización con Hikvision."
    };

    private static string Limit(string value, int length) =>
        value.Length <= length ? value : value[..length];

    private sealed record HikvisionUserSearchResult(
        bool Success,
        HikvisionUserInfo? User,
        string? Error);
}

public sealed record HikvisionAccessResult(
    bool Success,
    bool Enabled,
    DateOnly ExpirationDate,
    string? Error)
{
    public static HikvisionAccessResult Successful(bool enabled, DateOnly expirationDate) =>
        new(true, enabled, expirationDate, null);

    public static HikvisionAccessResult Failure(
        bool enabled,
        DateOnly expirationDate,
        string error) => new(false, enabled, expirationDate, error);
}

public sealed record HikvisionDeviceResult(
    bool Success,
    string? Model,
    string? FirmwareVersion,
    string? Error);

internal sealed class HikvisionSearchUserRequest
{
    public HikvisionSearchCondition UserInfoSearchCond { get; set; } = new();
}

internal sealed class HikvisionSearchCondition
{
    [JsonPropertyName("searchID")]
    public string SearchId { get; set; } = string.Empty;

    [JsonPropertyName("searchResultPosition")]
    public int SearchResultPosition { get; set; }

    [JsonPropertyName("maxResults")]
    public int MaxResults { get; set; }

    public List<HikvisionEmployeeNumber> EmployeeNoList { get; set; } = [];
}

internal sealed class HikvisionEmployeeNumber
{
    [JsonPropertyName("employeeNo")]
    public string EmployeeNo { get; set; } = string.Empty;
}

internal sealed class HikvisionSearchUserResponse
{
    public HikvisionUserSearch? UserInfoSearch { get; set; }
}

internal sealed class HikvisionUserSearch
{
    public List<HikvisionUserInfo> UserInfo { get; set; } = [];
}

internal sealed class HikvisionUserInfo
{
    [JsonPropertyName("employeeNo")]
    public string EmployeeNo { get; set; } = string.Empty;

    public HikvisionValid? Valid { get; set; }
}

internal sealed class HikvisionModifyUserRequest
{
    public HikvisionModifyUserInfo UserInfo { get; set; } = new();
}

internal sealed class HikvisionModifyUserInfo
{
    [JsonPropertyName("employeeNo")]
    public string EmployeeNo { get; set; } = string.Empty;

    public HikvisionValid Valid { get; set; } = new();
}

internal sealed class HikvisionValid
{
    [JsonPropertyName("enable")]
    public bool Enable { get; set; }

    [JsonPropertyName("beginTime")]
    public string BeginTime { get; set; } = string.Empty;

    [JsonPropertyName("endTime")]
    public string EndTime { get; set; } = string.Empty;

    [JsonPropertyName("timeType")]
    public string TimeType { get; set; } = "local";
}
