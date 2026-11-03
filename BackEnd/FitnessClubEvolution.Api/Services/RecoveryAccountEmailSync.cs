using System.ComponentModel.DataAnnotations;
using FitnessClubEvolution.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace FitnessClubEvolution.Api.Services;

/// <summary>
/// Vincula de forma idempotente los dos correos de recuperación configurados en
/// el VPS con las cuentas existentes. Evita guardar direcciones reales en Git.
/// </summary>
public static class RecoveryAccountEmailSync
{
    public static async Task<int> Ejecutar(
        AppDbContext context,
        IConfiguration configuration,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        var cuentas = new[]
        {
            new CuentaConfigurada(
                configuration["RecoveryAccounts:Rodrigo:UserName"],
                configuration["RecoveryAccounts:Rodrigo:Email"]),
            new CuentaConfigurada(
                configuration["RecoveryAccounts:Paola:UserName"],
                configuration["RecoveryAccounts:Paola:Email"])
        };

        var actualizadas = 0;
        foreach (var cuenta in cuentas)
        {
            if (string.IsNullOrWhiteSpace(cuenta.NombreUsuario) ||
                string.IsNullOrWhiteSpace(cuenta.CorreoElectronico))
            {
                continue;
            }

            var correo = cuenta.CorreoElectronico.Trim();
            if (!new EmailAddressAttribute().IsValid(correo))
            {
                logger.LogWarning("Se omitió un correo de recuperación con formato inválido.");
                continue;
            }

            var usuarioNormalizado = cuenta.NombreUsuario.Trim().ToUpperInvariant();
            var correoNormalizado = correo.ToUpperInvariant();
            var entrenador = await context.Entrenadores.SingleOrDefaultAsync(
                item => item.NombreUsuarioNormalizado == usuarioNormalizado,
                cancellationToken);

            if (entrenador is null)
            {
                logger.LogWarning(
                    "No se encontró la cuenta configurada para vincular un correo de recuperación.");
                continue;
            }

            var correoEnUso = await context.Entrenadores.AnyAsync(
                item =>
                    item.IdEntrenador != entrenador.IdEntrenador &&
                    item.CorreoElectronicoNormalizado == correoNormalizado,
                cancellationToken);
            if (correoEnUso)
            {
                logger.LogError("No se vinculó un correo de recuperación porque ya está en uso.");
                continue;
            }

            if (entrenador.CorreoElectronicoNormalizado == correoNormalizado &&
                entrenador.CorreoElectronico == correo)
            {
                continue;
            }

            entrenador.CorreoElectronico = correo;
            entrenador.CorreoElectronicoNormalizado = correoNormalizado;
            actualizadas++;
        }

        if (actualizadas > 0)
        {
            await context.SaveChangesAsync(cancellationToken);
        }

        return actualizadas;
    }

    private sealed record CuentaConfigurada(
        string? NombreUsuario,
        string? CorreoElectronico);
}
