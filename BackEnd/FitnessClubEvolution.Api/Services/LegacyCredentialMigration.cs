using FitnessClubEvolution.Api.Data;
using FitnessClubEvolution.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FitnessClubEvolution.Api.Services;

/// <summary>
/// Retira las contraseñas heredadas en texto plano después de aplicar la
/// migración de esquema. La transformación se realiza dentro del backend para
/// producir el formato oficial de ASP.NET Core y nunca escribe la clave en logs.
/// </summary>
public static class LegacyCredentialMigration
{
    public static async Task<int> Ejecutar(
        AppDbContext context,
        IPasswordHasher<Entrenador> passwordHasher,
        CancellationToken cancellationToken = default)
    {
        var cuentas = await context.Entrenadores
            .Where(entrenador =>
                entrenador.Contrasena != null &&
                entrenador.ContrasenaHash == null)
            .ToListAsync(cancellationToken);

        foreach (var cuenta in cuentas)
        {
            cuenta.ContrasenaHash = passwordHasher.HashPassword(
                cuenta,
                cuenta.Contrasena!);
            cuenta.Contrasena = null;
        }

        if (cuentas.Count > 0)
        {
            await context.SaveChangesAsync(cancellationToken);
        }

        return cuentas.Count;
    }
}
