using System.Net;
using System.Net.Mail;
using System.Text;

namespace FitnessClubEvolution.Api.Services;

public interface IRecoveryEmailSender
{
    Task<RecoveryEmailResult> EnviarCodigoAsync(
        string destinatario,
        string nombre,
        string codigo,
        DateTime fechaExpiracionUtc,
        CancellationToken cancellationToken);

    Task<RecoveryEmailResult> EnviarConfirmacionAsync(
        string destinatario,
        string nombre,
        CancellationToken cancellationToken);
}

/// <summary>
/// Entrega los correos de recuperación mediante un servidor SMTP configurable.
/// Las credenciales se reciben por configuración y nunca se guardan en código.
/// </summary>
public sealed class SmtpRecoveryEmailSender : IRecoveryEmailSender
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpRecoveryEmailSender> _logger;

    public SmtpRecoveryEmailSender(
        IConfiguration configuration,
        ILogger<SmtpRecoveryEmailSender> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public Task<RecoveryEmailResult> EnviarCodigoAsync(
        string destinatario,
        string nombre,
        string codigo,
        DateTime fechaExpiracionUtc,
        CancellationToken cancellationToken)
    {
        var nombreSeguro = WebUtility.HtmlEncode(nombre);
        var codigoSeguro = WebUtility.HtmlEncode(codigo);
        var horaExpiracion = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(
            fechaExpiracionUtc,
            "America/Montevideo");

        var cuerpo = $$"""
            <!doctype html>
            <html lang="es">
              <body style="margin:0;background:#090c09;color:#eef2ee;font-family:Arial,sans-serif">
                <div style="max-width:560px;margin:0 auto;padding:36px 20px">
                  <div style="border:1px solid #2d392d;border-radius:20px;background:#111611;padding:30px">
                    <p style="margin:0 0 10px;color:#9fdc1a;font-weight:700">FITNESSCLUBEVOLUTION</p>
                    <h1 style="margin:0 0 18px;font-size:25px">Recuperación de contraseña</h1>
                    <p style="line-height:1.6;color:#cbd3cb">Hola {{nombreSeguro}}. Usá este código para recuperar el acceso al sistema:</p>
                    <p style="margin:24px 0;text-align:center;font-size:34px;font-weight:800;letter-spacing:8px;color:#9fdc1a">{{codigoSeguro}}</p>
                    <p style="line-height:1.6;color:#cbd3cb">El código vence a las {{horaExpiracion:HH:mm}} y puede utilizarse una sola vez.</p>
                    <p style="margin:22px 0 0;font-size:13px;line-height:1.5;color:#8f998f">Si no solicitaste este cambio, ignorá el mensaje. Tu contraseña actual seguirá funcionando.</p>
                  </div>
                </div>
              </body>
            </html>
            """;

        return EnviarAsync(
            destinatario,
            "Código para recuperar tu contraseña",
            cuerpo,
            cancellationToken);
    }

    public Task<RecoveryEmailResult> EnviarConfirmacionAsync(
        string destinatario,
        string nombre,
        CancellationToken cancellationToken)
    {
        var nombreSeguro = WebUtility.HtmlEncode(nombre);
        var cuerpo = $$"""
            <!doctype html>
            <html lang="es">
              <body style="margin:0;background:#090c09;color:#eef2ee;font-family:Arial,sans-serif">
                <div style="max-width:560px;margin:0 auto;padding:36px 20px">
                  <div style="border:1px solid #2d392d;border-radius:20px;background:#111611;padding:30px">
                    <p style="margin:0 0 10px;color:#9fdc1a;font-weight:700">FITNESSCLUBEVOLUTION</p>
                    <h1 style="margin:0 0 18px;font-size:25px">Contraseña actualizada</h1>
                    <p style="line-height:1.6;color:#cbd3cb">Hola {{nombreSeguro}}. La contraseña de tu cuenta se cambió correctamente.</p>
                    <p style="margin:22px 0 0;font-size:13px;line-height:1.5;color:#8f998f">Si no realizaste este cambio, comunicate de inmediato con el otro administrador del gimnasio.</p>
                  </div>
                </div>
              </body>
            </html>
            """;

        return EnviarAsync(
            destinatario,
            "Tu contraseña fue actualizada",
            cuerpo,
            cancellationToken);
    }

    private async Task<RecoveryEmailResult> EnviarAsync(
        string destinatario,
        string asunto,
        string cuerpoHtml,
        CancellationToken cancellationToken)
    {
        var host = _configuration["Email:Smtp:Host"]?.Trim();
        var usuario = _configuration["Email:Smtp:UserName"]?.Trim();
        var contrasena = _configuration["Email:Smtp:Password"];
        var remitente = _configuration["Email:Smtp:FromAddress"]?.Trim();
        var nombreRemitente = _configuration["Email:Smtp:FromName"]?.Trim()
            ?? "FitnessClubEvolution";

        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(remitente))
        {
            _logger.LogError("No se configuró el servidor SMTP para recuperación de contraseña.");
            return new(false);
        }

        var puerto = _configuration.GetValue("Email:Smtp:Port", 587);
        var usarSsl = _configuration.GetValue("Email:Smtp:UseSsl", true);

        try
        {
            using var mensaje = new MailMessage
            {
                From = new MailAddress(remitente, nombreRemitente, Encoding.UTF8),
                Subject = asunto,
                SubjectEncoding = Encoding.UTF8,
                Body = cuerpoHtml,
                BodyEncoding = Encoding.UTF8,
                IsBodyHtml = true
            };
            mensaje.To.Add(new MailAddress(destinatario));

            using var cliente = new SmtpClient(host, puerto)
            {
                EnableSsl = usarSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false
            };

            if (!string.IsNullOrWhiteSpace(usuario))
            {
                cliente.Credentials = new NetworkCredential(usuario, contrasena);
            }

            await cliente.SendMailAsync(mensaje, cancellationToken);
            return new(true);
        }
        catch (Exception error) when (
            error is SmtpException or
            InvalidOperationException or
            FormatException or
            ArgumentException)
        {
            _logger.LogError(error, "No se pudo entregar un correo de recuperación por SMTP.");
            return new(false);
        }
    }
}

public readonly record struct RecoveryEmailResult(bool Entregado);
