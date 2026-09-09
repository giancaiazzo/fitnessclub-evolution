using FitnessClubEvolution.Api.Data;
using FitnessClubEvolution.Api.Models;
using FitnessClubEvolution.Api.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Net;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddAuthorization();
builder.Services.AddScoped<IPasswordHasher<Entrenador>, PasswordHasher<Entrenador>>();
builder.Services.AddScoped<IPasswordHasher<SolicitudRecuperacion>, PasswordHasher<SolicitudRecuperacion>>();
builder.Services.AddScoped<IRecoveryEmailSender, SmtpRecoveryEmailSender>();
builder.Services.AddHttpClient<IN8nWebhookClient, N8nWebhookClient>(client =>
{
    // El alta ya está confirmada en PostgreSQL. Este llamado solo despierta
    // n8n y nunca debe dejar al usuario esperando indefinidamente.
    client.Timeout = TimeSpan.FromSeconds(5);
});
builder.Services.Configure<HikvisionOptions>(
    builder.Configuration.GetSection("Integrations:Hikvision"));
builder.Services.AddScoped<IHikvisionClientAccessCoordinator, HikvisionClientAccessCoordinator>();
builder.Services
    .AddHttpClient<IHikvisionAccessService, HikvisionAccessService>((services, client) =>
    {
        var options = services.GetRequiredService<IOptions<HikvisionOptions>>().Value;
        client.Timeout = TimeSpan.FromSeconds(Math.Clamp(options.TimeoutSeconds, 3, 30));
    })
    .ConfigurePrimaryHttpMessageHandler(services =>
    {
        var options = services.GetRequiredService<IOptions<HikvisionOptions>>().Value;
        var handler = new HttpClientHandler
        {
            Credentials = new NetworkCredential(options.Username, options.Password),
            PreAuthenticate = false,
            AllowAutoRedirect = false
        };

        // El controlador usa un certificado propio. Esta excepción solo afecta
        // al HttpClient dedicado a la URL fija configurada para Hikvision.
        if (options.AllowInvalidCertificate)
        {
            handler.ServerCertificateCustomValidationCallback =
                HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;
        }

        return handler;
    });

// Los límites frenan fuerza bruta y abuso de códigos sin afectar los CRUD del
// panel. En producción puede reemplazarse el almacén en memoria por uno
// distribuido si se ejecutan varias réplicas del backend.
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("Autenticacion", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "desconocida",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            }));
    options.AddPolicy("Recuperacion", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "desconocida",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(10),
                QueueLimit = 0,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            }));
});

builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "FitnessClubEvolution.Auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.IsEssential = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = builder.Environment.IsProduction()
            ? CookieSecurePolicy.Always
            : CookieSecurePolicy.SameAsRequest;
        options.ExpireTimeSpan = TimeSpan.FromHours(8);
        options.SlidingExpiration = true;

        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };

        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });

var origenesPermitidos = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ??
    [
        "http://localhost:5173",
        "http://localhost:4173"
    ];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(origenesPermitidos)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

if (builder.Configuration.GetValue("Database:ApplyMigrations", false))
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.MigrateAsync();

    var passwordHasher = scope.ServiceProvider
        .GetRequiredService<IPasswordHasher<Entrenador>>();
    var credencialesMigradas = await LegacyCredentialMigration.Ejecutar(
        dbContext,
        passwordHasher);
    if (credencialesMigradas > 0)
    {
        app.Logger.LogInformation(
            "Se migraron {Cantidad} credenciales históricas a hash.",
            credencialesMigradas);
    }

    var correosVinculados = await RecoveryAccountEmailSync.Ejecutar(
        dbContext,
        builder.Configuration,
        app.Logger);
    if (correosVinculados > 0)
    {
        app.Logger.LogInformation(
            "Se vincularon {Cantidad} correos de recuperación administrativa.",
            correosVinculados);
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// El backend no publica su puerto: únicamente Caddy puede alcanzarlo desde la
// red Docker. Se confía exactamente en un salto para recuperar IP y esquema
// reales, necesarios para cookies seguras, auditoría y rate limiting por IP.
var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor |
        ForwardedHeaders.XForwardedProto,
    ForwardLimit = 1
};
forwardedHeadersOptions.KnownIPNetworks.Clear();
forwardedHeadersOptions.KnownProxies.Clear();
app.UseForwardedHeaders(forwardedHeadersOptions);

app.UseCors("Frontend");

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
    .AllowAnonymous();
app.MapControllers();

app.Run();
