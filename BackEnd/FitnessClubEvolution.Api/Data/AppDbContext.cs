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
    public DbSet<MensajeWhatsapp> MensajesWhatsapp { get; set; } = null!;
    public DbSet<SolicitudRecuperacion> SolicitudesRecuperacion { get; set; } = null!;

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

            entity.Property(cliente => cliente.AceptaWhatsApp)
                .HasDefaultValue(false);

            entity.HasIndex(cliente => cliente.Documento);

            entity.HasIndex(cliente => cliente.IdRutina);

            // El índice acelera la identificación que realiza el bot. No es
            // único para que una eventual duplicación histórica no bloquee la
            // migración; el endpoint de n8n rechaza resultados ambiguos.
            entity.HasIndex(cliente => cliente.Telefono);

            entity.HasOne(cliente => cliente.Rutina)
                .WithMany(rutina => rutina.Clientes)
                .HasForeignKey(cliente => cliente.IdRutina)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);
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

        modelBuilder.Entity<Entrenador>(entity =>
        {
            entity.HasKey(entrenador => entrenador.IdEntrenador);

            entity.Property(entrenador => entrenador.Nombre)
                .IsRequired();

            entity.Property(entrenador => entrenador.Apellido)
                .IsRequired();

            entity.Property(entrenador => entrenador.Telefono)
                .IsRequired();

            entity.Property(entrenador => entrenador.NombreUsuario)
                .HasMaxLength(60)
                .IsRequired();

            entity.Property(entrenador => entrenador.NombreUsuarioNormalizado)
                .HasMaxLength(60)
                .IsRequired();

            entity.Property(entrenador => entrenador.ContrasenaHash)
                .HasMaxLength(500);

            entity.Property(entrenador => entrenador.Rol)
                .HasMaxLength(30)
                .HasDefaultValue("Administrador")
                .IsRequired();

            entity.Property(entrenador => entrenador.Estado)
                .HasDefaultValue(true);

            entity.Property(entrenador => entrenador.FechaCreacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(entrenador => entrenador.NombreUsuarioNormalizado)
                .IsUnique();

            entity.HasIndex(entrenador => entrenador.Telefono);
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
            entity.HasKey(notificacion => notificacion.IdNotificacion);

            entity.Property(notificacion => notificacion.Tipo)
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(notificacion => notificacion.Mensaje)
                .HasMaxLength(1000)
                .IsRequired();

            entity.Property(notificacion => notificacion.Estado)
                .HasMaxLength(30)
                .HasDefaultValue("Pendiente")
                .IsRequired();

            entity.Property(notificacion => notificacion.ClaveIdempotencia)
                .HasMaxLength(160);

            entity.Property(notificacion => notificacion.Canal)
                .HasMaxLength(30)
                .HasDefaultValue("WhatsApp")
                .IsRequired();

            entity.Property(notificacion => notificacion.Referencia)
                .HasMaxLength(100);

            entity.Property(notificacion => notificacion.IdMensajeExterno)
                .HasMaxLength(150);

            entity.Property(notificacion => notificacion.UltimoError)
                .HasMaxLength(1000);

            entity.Property(notificacion => notificacion.FechaCreacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(notificacion => notificacion.Cliente)
                .WithMany(cliente => cliente.Notificaciones)
                .HasForeignKey(notificacion => notificacion.IdCliente)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(notificacion => notificacion.ClaveIdempotencia)
                .IsUnique();

            entity.HasIndex(notificacion => new
            {
                notificacion.Estado,
                notificacion.FechaProgramada
            });
        });

        modelBuilder.Entity<MensajeWhatsapp>(entity =>
        {
            entity.HasKey(mensaje => mensaje.IdMensajeWhatsapp);

            entity.Property(mensaje => mensaje.FechaRecepcion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(mensaje => mensaje.IdMensajeMeta)
                .IsUnique();

            entity.HasIndex(mensaje => new
            {
                mensaje.Telefono,
                mensaje.FechaRecepcion
            });

            entity.HasOne(mensaje => mensaje.Cliente)
                .WithMany(cliente => cliente.MensajesWhatsapp)
                .HasForeignKey(mensaje => mensaje.IdCliente)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<SolicitudRecuperacion>(entity =>
        {
            entity.HasKey(solicitud => solicitud.IdSolicitudRecuperacion);

            entity.Property(solicitud => solicitud.FechaCreacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(solicitud => solicitud.Estado)
                .HasDefaultValue("Pendiente")
                .IsRequired();

            entity.Property(solicitud => solicitud.MaxIntentos)
                .HasDefaultValue(5);

            entity.HasIndex(solicitud => new
            {
                solicitud.IdEntrenador,
                solicitud.Estado,
                solicitud.FechaExpiracion
            });

            entity.HasOne(solicitud => solicitud.Entrenador)
                .WithMany(entrenador => entrenador.SolicitudesRecuperacion)
                .HasForeignKey(solicitud => solicitud.IdEntrenador)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
