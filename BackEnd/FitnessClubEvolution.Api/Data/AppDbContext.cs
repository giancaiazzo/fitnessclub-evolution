using FitnessClubEvolution.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FitnessClubEvolution.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Cliente> Clientes { get; set; } = null!;
    public DbSet<Entrenador> Entrenadores { get; set; } = null!;
    public DbSet<Servicio> Servicios { get; set; } = null!;
    public DbSet<Rutina> Rutinas { get; set; } = null!;
    public DbSet<Ejercicio> Ejercicios { get; set; } = null!;
    public DbSet<Cuota> Cuotas { get; set; } = null!;
    public DbSet<Notificacion> Notificaciones { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasKey(cliente => cliente.IdCliente);

            entity.Property(cliente => cliente.Nombre)
                .IsRequired();

            entity.Property(cliente => cliente.Apellido)
                .IsRequired();

            entity.Property(cliente => cliente.Documento)
                .IsRequired();

            entity.Property(cliente => cliente.Telefono)
                .IsRequired();

            entity.HasIndex(cliente => cliente.Documento);
        });

        modelBuilder.Entity<Cuota>(entity =>
        {
            entity.HasKey(cuota => cuota.IdCuota);

            entity.Property(cuota => cuota.Monto)
                .HasPrecision(12, 2);

            entity.Property(cuota => cuota.MetodoPago)
                .IsRequired();

            entity.Property(cuota => cuota.EstadoPago)
                .HasMaxLength(20)
                .HasDefaultValue("Confirmado")
                .IsRequired();

            entity.HasOne(cuota => cuota.Cliente)
                .WithMany(cliente => cliente.Cuotas)
                .HasForeignKey(cuota => cuota.IdCliente)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(cuota => cuota.Entrenador)
                .WithMany(entrenador => entrenador.CuotasRegistradas)
                .HasForeignKey(cuota => cuota.IdEntrenador)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(cuota => new
            {
                cuota.IdCliente,
                cuota.FechaVencimiento
            });
        });

        modelBuilder.Entity<Servicio>(entity =>
        {
            entity.HasKey(servicio => servicio.IdServicio);

            entity.Property(servicio => servicio.Nombre)
                .HasMaxLength(80)
                .IsRequired();

            entity.Property(servicio => servicio.Descripcion)
                .HasMaxLength(500);

            entity.Property(servicio => servicio.Precio)
                .HasPrecision(12, 2);

            entity.Property(servicio => servicio.Duracion)
                .HasMaxLength(50);

            entity.Property(servicio => servicio.NombreArchivoImagen)
                .HasMaxLength(255);

            entity.Property(servicio => servicio.TipoContenidoImagen)
                .HasMaxLength(50);

            entity.HasIndex(servicio => servicio.Nombre);
        });

        modelBuilder.Entity<Rutina>(entity =>
        {
            entity.HasKey(rutina => rutina.IdRutina);

            entity.Property(rutina => rutina.Nombre)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(rutina => rutina.Descripcion)
                .HasMaxLength(500);

            entity.Property(rutina => rutina.NombreArchivoPdf)
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(rutina => rutina.TipoContenidoPdf)
                .HasMaxLength(100);

            entity.HasIndex(rutina => rutina.Nombre);
        });

        modelBuilder.Entity<Ejercicio>(entity =>
        {
            entity.HasKey(ejercicio => ejercicio.IdEjercicio);

            entity.Property(ejercicio => ejercicio.Nombre)
                .IsRequired();

            entity.Property(ejercicio => ejercicio.GrupoMuscular)
                .IsRequired()
                .HasDefaultValue("Sin clasificar");

            entity.Property(ejercicio => ejercicio.Estado)
                .HasDefaultValue(true);

            entity.Property(ejercicio => ejercicio.NombreArchivoImagen)
                .HasMaxLength(255);

            entity.Property(ejercicio => ejercicio.TipoContenidoImagen)
                .HasMaxLength(50);

            entity.Property(ejercicio => ejercicio.NombreArchivoVideo)
                .HasMaxLength(255);

            entity.Property(ejercicio => ejercicio.TipoContenidoVideo)
                .HasMaxLength(50);

            entity.Property(ejercicio => ejercicio.FechaRegistro)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(ejercicio => ejercicio.Nombre);

            entity.HasIndex(ejercicio => new
            {
                ejercicio.GrupoMuscular,
                ejercicio.Estado
            });
        });

        modelBuilder.Entity<Notificacion>(entity =>
        {
            entity.HasOne(notificacion => notificacion.Cliente)
                .WithMany(cliente => cliente.Notificaciones)
                .HasForeignKey(notificacion => notificacion.IdCliente)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
