using FitnessClubEvolution.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FitnessClubEvolution.Api.Migrations;

/// <summary>
/// Prepara PostgreSQL para la autenticación segura y la orquestación con n8n:
/// consentimiento, recuperación, idempotencia, outbox y auditoría mínima de
/// eventos de WhatsApp. No inserta claves ni contraseñas de producción.
/// </summary>
[DbContext(typeof(AppDbContext))]
[Migration("20260820120000_PrepararAutomatizacionYSeguridad")]
public partial class PrepararAutomatizacionYSeguridad : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "AceptaWhatsApp",
            table: "Clientes",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<DateTime>(
            name: "FechaBajaWhatsApp",
            table: "Clientes",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "FechaConsentimientoWhatsApp",
            table: "Clientes",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "Contrasena",
            table: "Entrenadores",
            type: "text",
            nullable: true,
            oldClrType: typeof(string),
            oldType: "text");

        // Se agregan temporalmente como null para poblar los nombres de usuario
        // existentes antes de aplicar NOT NULL y el índice único.
        migrationBuilder.AddColumn<string>(
            name: "NombreUsuario",
            table: "Entrenadores",
            type: "character varying(60)",
            maxLength: 60,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "NombreUsuarioNormalizado",
            table: "Entrenadores",
            type: "character varying(60)",
            maxLength: 60,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "ContrasenaHash",
            table: "Entrenadores",
            type: "character varying(500)",
            maxLength: 500,
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "Estado",
            table: "Entrenadores",
            type: "boolean",
            nullable: false,
            defaultValue: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "FechaCreacion",
            table: "Entrenadores",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "CURRENT_TIMESTAMP");

        migrationBuilder.AddColumn<string>(
            name: "Rol",
            table: "Entrenadores",
            type: "character varying(30)",
            maxLength: 30,
            nullable: false,
            defaultValue: "Administrador");

        migrationBuilder.AddColumn<DateTime>(
            name: "UltimoAcceso",
            table: "Entrenadores",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.Sql(
            """
            WITH candidatos AS (
                SELECT
                    "IdEntrenador",
                    CASE
                        WHEN BTRIM(COALESCE("Nombre", '')) = ''
                            THEN 'usuario-' || "IdEntrenador"::text
                        ELSE LEFT(BTRIM("Nombre"), 50)
                    END AS base,
                    ROW_NUMBER() OVER (
                        PARTITION BY UPPER(BTRIM(COALESCE("Nombre", '')))
                        ORDER BY "IdEntrenador"
                    ) AS numero
                FROM "Entrenadores"
            )
            UPDATE "Entrenadores" AS entrenador
            SET "NombreUsuario" = CASE
                    WHEN candidatos.numero = 1 THEN candidatos.base
                    ELSE LEFT(candidatos.base, 50) || '-' || entrenador."IdEntrenador"::text
                END,
                "NombreUsuarioNormalizado" = UPPER(CASE
                    WHEN candidatos.numero = 1 THEN candidatos.base
                    ELSE LEFT(candidatos.base, 50) || '-' || entrenador."IdEntrenador"::text
                END)
            FROM candidatos
            WHERE candidatos."IdEntrenador" = entrenador."IdEntrenador";

            -- Resuelve también una colisión poco frecuente entre un sufijo
            -- generado (por ejemplo, Ana-2) y un nombre histórico literal.
            WITH duplicados AS (
                SELECT "NombreUsuarioNormalizado"
                FROM "Entrenadores"
                GROUP BY "NombreUsuarioNormalizado"
                HAVING COUNT(*) > 1
            )
            UPDATE "Entrenadores" AS entrenador
            SET "NombreUsuario" = 'usuario-' || entrenador."IdEntrenador"::text || '-' ||
                    SUBSTRING(MD5(entrenador."IdEntrenador"::text || entrenador."Telefono"), 1, 8),
                "NombreUsuarioNormalizado" = UPPER(
                    'usuario-' || entrenador."IdEntrenador"::text || '-' ||
                    SUBSTRING(MD5(entrenador."IdEntrenador"::text || entrenador."Telefono"), 1, 8)
                )
            FROM duplicados
            WHERE entrenador."NombreUsuarioNormalizado" = duplicados."NombreUsuarioNormalizado";
            """);

        migrationBuilder.AlterColumn<string>(
            name: "NombreUsuario",
            table: "Entrenadores",
            type: "character varying(60)",
            maxLength: 60,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(60)",
            oldMaxLength: 60,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "NombreUsuarioNormalizado",
            table: "Entrenadores",
            type: "character varying(60)",
            maxLength: 60,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(60)",
            oldMaxLength: 60,
            oldNullable: true);

        migrationBuilder.Sql(
            """
            UPDATE "Notificaciones"
            SET "Tipo" = LEFT("Tipo", 50),
                "Mensaje" = LEFT("Mensaje", 1000),
                "Estado" = LEFT("Estado", 30);
            """);

        migrationBuilder.AlterColumn<string>(
            name: "Tipo",
            table: "Notificaciones",
            type: "character varying(50)",
            maxLength: 50,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "text");

        migrationBuilder.AlterColumn<string>(
            name: "Mensaje",
            table: "Notificaciones",
            type: "character varying(1000)",
            maxLength: 1000,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "text");

        migrationBuilder.AlterColumn<string>(
            name: "Estado",
            table: "Notificaciones",
            type: "character varying(30)",
            maxLength: 30,
            nullable: false,
            defaultValue: "Pendiente",
            oldClrType: typeof(string),
            oldType: "text");

        migrationBuilder.AddColumn<string>(
            name: "Canal",
            table: "Notificaciones",
            type: "character varying(30)",
            maxLength: 30,
            nullable: false,
            defaultValue: "WhatsApp");

        migrationBuilder.AddColumn<string>(
            name: "ClaveIdempotencia",
            table: "Notificaciones",
            type: "character varying(160)",
            maxLength: 160,
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "FechaActualizacion",
            table: "Notificaciones",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "FechaCreacion",
            table: "Notificaciones",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "CURRENT_TIMESTAMP");

        migrationBuilder.AddColumn<DateTime>(
            name: "FechaEntrega",
            table: "Notificaciones",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "FechaLectura",
            table: "Notificaciones",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "IdMensajeExterno",
            table: "Notificaciones",
            type: "character varying(150)",
            maxLength: 150,
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "Intentos",
            table: "Notificaciones",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<string>(
            name: "Referencia",
            table: "Notificaciones",
            type: "character varying(100)",
            maxLength: 100,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "UltimoError",
            table: "Notificaciones",
            type: "character varying(1000)",
            maxLength: 1000,
            nullable: true);

        migrationBuilder.CreateTable(
            name: "MensajesWhatsapp",
            columns: table => new
            {
                IdMensajeWhatsapp = table.Column<long>(type: "bigint", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                IdMensajeMeta = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                Telefono = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                Direccion = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                Tipo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                Resumen = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                EstadoProcesamiento = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                Intentos = table.Column<int>(type: "integer", nullable: false),
                UltimoError = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                FechaRecepcion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                FechaProcesamiento = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                IdCliente = table.Column<int>(type: "integer", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_MensajesWhatsapp", x => x.IdMensajeWhatsapp);
                table.ForeignKey(
                    name: "FK_MensajesWhatsapp_Clientes_IdCliente",
                    column: x => x.IdCliente,
                    principalTable: "Clientes",
                    principalColumn: "IdCliente",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "SolicitudesRecuperacion",
            columns: table => new
            {
                IdSolicitudRecuperacion = table.Column<long>(type: "bigint", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                IdEntrenador = table.Column<int>(type: "integer", nullable: false),
                CodigoHash = table.Column<string>(type: "text", nullable: false),
                FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                FechaExpiracion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                FechaUso = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                Intentos = table.Column<int>(type: "integer", nullable: false),
                MaxIntentos = table.Column<int>(type: "integer", nullable: false, defaultValue: 5),
                Estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Pendiente"),
                IpSolicitud = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_SolicitudesRecuperacion", x => x.IdSolicitudRecuperacion);
                table.ForeignKey(
                    name: "FK_SolicitudesRecuperacion_Entrenadores_IdEntrenador",
                    column: x => x.IdEntrenador,
                    principalTable: "Entrenadores",
                    principalColumn: "IdEntrenador",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Clientes_Telefono",
            table: "Clientes",
            column: "Telefono");

        migrationBuilder.CreateIndex(
            name: "IX_Entrenadores_NombreUsuarioNormalizado",
            table: "Entrenadores",
            column: "NombreUsuarioNormalizado",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Entrenadores_Telefono",
            table: "Entrenadores",
            column: "Telefono");

        migrationBuilder.CreateIndex(
            name: "IX_Notificaciones_ClaveIdempotencia",
            table: "Notificaciones",
            column: "ClaveIdempotencia",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Notificaciones_Estado_FechaProgramada",
            table: "Notificaciones",
            columns: new[] { "Estado", "FechaProgramada" });

        migrationBuilder.CreateIndex(
            name: "IX_MensajesWhatsapp_IdCliente",
            table: "MensajesWhatsapp",
            column: "IdCliente");

        migrationBuilder.CreateIndex(
            name: "IX_MensajesWhatsapp_IdMensajeMeta",
            table: "MensajesWhatsapp",
            column: "IdMensajeMeta",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_MensajesWhatsapp_Telefono_FechaRecepcion",
            table: "MensajesWhatsapp",
            columns: new[] { "Telefono", "FechaRecepcion" });

        migrationBuilder.CreateIndex(
            name: "IX_SolicitudesRecuperacion_IdEntrenador_Estado_FechaExpiracion",
            table: "SolicitudesRecuperacion",
            columns: new[] { "IdEntrenador", "Estado", "FechaExpiracion" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "MensajesWhatsapp");
        migrationBuilder.DropTable(name: "SolicitudesRecuperacion");

        migrationBuilder.DropIndex(name: "IX_Clientes_Telefono", table: "Clientes");
        migrationBuilder.DropIndex(name: "IX_Entrenadores_NombreUsuarioNormalizado", table: "Entrenadores");
        migrationBuilder.DropIndex(name: "IX_Entrenadores_Telefono", table: "Entrenadores");
        migrationBuilder.DropIndex(name: "IX_Notificaciones_ClaveIdempotencia", table: "Notificaciones");
        migrationBuilder.DropIndex(name: "IX_Notificaciones_Estado_FechaProgramada", table: "Notificaciones");

        migrationBuilder.DropColumn(name: "AceptaWhatsApp", table: "Clientes");
        migrationBuilder.DropColumn(name: "FechaBajaWhatsApp", table: "Clientes");
        migrationBuilder.DropColumn(name: "FechaConsentimientoWhatsApp", table: "Clientes");

        migrationBuilder.DropColumn(name: "ContrasenaHash", table: "Entrenadores");
        migrationBuilder.DropColumn(name: "Estado", table: "Entrenadores");
        migrationBuilder.DropColumn(name: "FechaCreacion", table: "Entrenadores");
        migrationBuilder.DropColumn(name: "NombreUsuario", table: "Entrenadores");
        migrationBuilder.DropColumn(name: "NombreUsuarioNormalizado", table: "Entrenadores");
        migrationBuilder.DropColumn(name: "Rol", table: "Entrenadores");
        migrationBuilder.DropColumn(name: "UltimoAcceso", table: "Entrenadores");

        migrationBuilder.Sql(
            """
            UPDATE "Entrenadores"
            SET "Contrasena" = ''
            WHERE "Contrasena" IS NULL;
            """);

        migrationBuilder.AlterColumn<string>(
            name: "Contrasena",
            table: "Entrenadores",
            type: "text",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "text",
            oldNullable: true);

        migrationBuilder.DropColumn(name: "Canal", table: "Notificaciones");
        migrationBuilder.DropColumn(name: "ClaveIdempotencia", table: "Notificaciones");
        migrationBuilder.DropColumn(name: "FechaActualizacion", table: "Notificaciones");
        migrationBuilder.DropColumn(name: "FechaCreacion", table: "Notificaciones");
        migrationBuilder.DropColumn(name: "FechaEntrega", table: "Notificaciones");
        migrationBuilder.DropColumn(name: "FechaLectura", table: "Notificaciones");
        migrationBuilder.DropColumn(name: "IdMensajeExterno", table: "Notificaciones");
        migrationBuilder.DropColumn(name: "Intentos", table: "Notificaciones");
        migrationBuilder.DropColumn(name: "Referencia", table: "Notificaciones");
        migrationBuilder.DropColumn(name: "UltimoError", table: "Notificaciones");

        migrationBuilder.AlterColumn<string>(
            name: "Tipo",
            table: "Notificaciones",
            type: "text",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(50)",
            oldMaxLength: 50);

        migrationBuilder.AlterColumn<string>(
            name: "Mensaje",
            table: "Notificaciones",
            type: "text",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(1000)",
            oldMaxLength: 1000);

        migrationBuilder.AlterColumn<string>(
            name: "Estado",
            table: "Notificaciones",
            type: "text",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(30)",
            oldMaxLength: 30,
            oldDefaultValue: "Pendiente");
    }
}
