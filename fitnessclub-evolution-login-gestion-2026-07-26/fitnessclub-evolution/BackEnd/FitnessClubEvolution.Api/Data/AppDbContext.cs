using FitnessClubEvolution.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FitnessClubEvolution.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Entrenador> Entrenadores { get; set; }
        public DbSet<Servicio> Servicios { get; set; }
        public DbSet<Rutina> Rutinas { get; set; }
        public DbSet<Ejercicio> Ejercicios { get; set; }
        public DbSet<Cuota> Cuotas { get; set; }
        public DbSet<Notificacion> Notificaciones { get; set; }
        

    }
}
