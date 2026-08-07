namespace FitnessClubEvolution.Api.Services;

public static class FechaGimnasio
{
    private static readonly TimeZoneInfo ZonaHoraria = ObtenerZonaHoraria();

    public static DateOnly Hoy(DateTime? instanteUtc = null)
    {
        var utc = instanteUtc ?? DateTime.UtcNow;
        return DesdeUtc(utc);
    }

    public static DateOnly DesdeUtc(DateTime instanteUtc)
    {
        var local = TimeZoneInfo.ConvertTimeFromUtc(
            DateTime.SpecifyKind(instanteUtc, DateTimeKind.Utc),
            ZonaHoraria);

        return DateOnly.FromDateTime(local);
    }

    private static TimeZoneInfo ObtenerZonaHoraria()
    {
        foreach (var identificador in new[] { "America/Montevideo", "Montevideo Standard Time" })
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById(identificador);
            }
            catch (TimeZoneNotFoundException)
            {
                // Se intenta el identificador compatible con el otro sistema operativo.
            }
            catch (InvalidTimeZoneException)
            {
                // Se intenta el identificador compatible con el otro sistema operativo.
            }
        }

        return TimeZoneInfo.Utc;
    }
}
