using FitnessClubEvolution.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessClubEvolution.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260803130000_ImplementarRegistroPagos")]
public partial class ImplementarRegistroPagos : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Cuotas_Clientes_ClienteIdCliente",
            table: "Cuotas");

        migrationBuilder.DropForeignKey(
            name: "FK_Cuotas_Entrenadores_EntrenadorIdEntrenador",
            table: "Cuotas");

        migrationBuilder.DropForeignKey(
            name: "FK_Cuotas_Servicios_ServicioIdServicio",
            table: "Cuotas");

        migrationBuilder.DropForeignKey(
            name: "FK_Notificaciones_Clientes_ClienteIdCliente",
            table: "Notificaciones");

        migrationBuilder.DropIndex(name: "IX_Cuotas_ClienteIdCliente", table: "Cuotas");
        migrationBuilder.DropIndex(name: "IX_Cuotas_EntrenadorIdEntrenador", table: "Cuotas");
        migrationBuilder.DropIndex(name: "IX_Cuotas_ServicioIdServicio", table: "Cuotas");
        migrationBuilder.DropIndex(name: "IX_Notificaciones_ClienteIdCliente", table: "Notificaciones");

        migrationBuilder.AddColumn<string>(
            name: "EstadoPago",
            table: "Cuotas",
            type: "character varying(20)",
            maxLength: 20,
            nullable: false,
            defaultValue: "Confirmado");

        migrationBuilder.AddColumn<DateOnly>(
            name: "FechaInicio",
            table: "Cuotas",
            type: "date",
            nullable: true);

        migrationBuilder.AddColumn<DateOnly>(
            name: "FechaVencimiento",
            table: "Cuotas",
            type: "date",
            nullable: true);

        migrationBuilder.Sql(
            """
            UPDATE "Cuotas"
            SET "IdCliente" = "ClienteIdCliente",
                "IdServicio" = "ServicioIdServicio",
                "IdEntrenador" = "EntrenadorIdEntrenador",
                "FechaInicio" = ("FechaPago" AT TIME ZONE 'America/Montevideo')::date,
                "FechaVencimiento" = (("FechaPago" AT TIME ZONE 'America/Montevideo') + INTERVAL '1 month')::date,
                "MetodoPago" = CASE
                    WHEN "MetodoPago" IS NULL OR BTRIM("MetodoPago") = '' THEN 'Sin especificar'
                    ELSE "MetodoPago"
                END;

            UPDATE "Notificaciones"
            SET "IdCliente" = "ClienteIdCliente";
            """);

        migrationBuilder.DropColumn(name: "ClienteIdCliente", table: "Cuotas");
        migrationBuilder.DropColumn(name: "EntrenadorIdEntrenador", table: "Cuotas");
        migrationBuilder.DropColumn(name: "ServicioIdServicio", table: "Cuotas");
        migrationBuilder.DropColumn(name: "ClienteIdCliente", table: "Notificaciones");

        migrationBuilder.AlterColumn<DateOnly>(
            name: "FechaInicio",
            table: "Cuotas",
            type: "date",
            nullable: false,
            oldClrType: typeof(DateOnly),
            oldType: "date",
            oldNullable: true);

        migrationBuilder.AlterColumn<DateOnly>(
            name: "FechaVencimiento",
            table: "Cuotas",
            type: "date",
            nullable: false,
            oldClrType: typeof(DateOnly),
            oldType: "date",
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "MetodoPago",
            table: "Cuotas",
            type: "text",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "text",
            oldNullable: true);

        migrationBuilder.AlterColumn<decimal>(
            name: "Monto",
            table: "Cuotas",
            type: "numeric(12,2)",
            precision: 12,
            scale: 2,
            nullable: false,
            oldClrType: typeof(decimal),
            oldType: "numeric");

        migrationBuilder.Sql(
            """
            ALTER TABLE "Clientes"
            ALTER COLUMN "FechaNacimiento" TYPE date
            USING ("FechaNacimiento" AT TIME ZONE 'UTC')::date;
            """);

        migrationBuilder.CreateIndex(
            name: "IX_Clientes_Documento",
            table: "Clientes",
            column: "Documento");

        migrationBuilder.CreateIndex(
            name: "IX_Cuotas_IdCliente_FechaVencimiento",
            table: "Cuotas",
            columns: new[] { "IdCliente", "FechaVencimiento" });

        migrationBuilder.CreateIndex(
            name: "IX_Cuotas_IdEntrenador",
            table: "Cuotas",
            column: "IdEntrenador");

        migrationBuilder.CreateIndex(
            name: "IX_Cuotas_IdServicio",
            table: "Cuotas",
            column: "IdServicio");

        migrationBuilder.CreateIndex(
            name: "IX_Notificaciones_IdCliente",
            table: "Notificaciones",
            column: "IdCliente");

        migrationBuilder.AddForeignKey(
            name: "FK_Cuotas_Clientes_IdCliente",
            table: "Cuotas",
            column: "IdCliente",
            principalTable: "Clientes",
            principalColumn: "IdCliente",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "FK_Cuotas_Entrenadores_IdEntrenador",
            table: "Cuotas",
            column: "IdEntrenador",
            principalTable: "Entrenadores",
            principalColumn: "IdEntrenador",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "FK_Cuotas_Servicios_IdServicio",
            table: "Cuotas",
            column: "IdServicio",
            principalTable: "Servicios",
            principalColumn: "IdServicio",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "FK_Notificaciones_Clientes_IdCliente",
            table: "Notificaciones",
            column: "IdCliente",
            principalTable: "Clientes",
            principalColumn: "IdCliente",
            onDelete: ReferentialAction.Cascade);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(name: "FK_Cuotas_Clientes_IdCliente", table: "Cuotas");
        migrationBuilder.DropForeignKey(name: "FK_Cuotas_Entrenadores_IdEntrenador", table: "Cuotas");
        migrationBuilder.DropForeignKey(name: "FK_Cuotas_Servicios_IdServicio", table: "Cuotas");
        migrationBuilder.DropForeignKey(name: "FK_Notificaciones_Clientes_IdCliente", table: "Notificaciones");

        migrationBuilder.DropIndex(name: "IX_Clientes_Documento", table: "Clientes");
        migrationBuilder.DropIndex(name: "IX_Cuotas_IdCliente_FechaVencimiento", table: "Cuotas");
        migrationBuilder.DropIndex(name: "IX_Cuotas_IdEntrenador", table: "Cuotas");
        migrationBuilder.DropIndex(name: "IX_Cuotas_IdServicio", table: "Cuotas");
        migrationBuilder.DropIndex(name: "IX_Notificaciones_IdCliente", table: "Notificaciones");

        migrationBuilder.AddColumn<int>(
            name: "ClienteIdCliente",
            table: "Cuotas",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<int?>(
            name: "EntrenadorIdEntrenador",
            table: "Cuotas",
            type: "integer",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "ServicioIdServicio",
            table: "Cuotas",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<int>(
            name: "ClienteIdCliente",
            table: "Notificaciones",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.Sql(
            """
            UPDATE "Cuotas"
            SET "ClienteIdCliente" = "IdCliente",
                "ServicioIdServicio" = "IdServicio",
                "EntrenadorIdEntrenador" = "IdEntrenador";

            UPDATE "Notificaciones"
            SET "ClienteIdCliente" = "IdCliente";

            ALTER TABLE "Clientes"
            ALTER COLUMN "FechaNacimiento" TYPE timestamp with time zone
            USING ("FechaNacimiento"::timestamp AT TIME ZONE 'UTC');
            """);

        migrationBuilder.AlterColumn<string>(
            name: "MetodoPago",
            table: "Cuotas",
            type: "text",
            nullable: true,
            oldClrType: typeof(string),
            oldType: "text");

        migrationBuilder.AlterColumn<decimal>(
            name: "Monto",
            table: "Cuotas",
            type: "numeric",
            nullable: false,
            oldClrType: typeof(decimal),
            oldType: "numeric(12,2)",
            oldPrecision: 12,
            oldScale: 2);

        migrationBuilder.DropColumn(name: "EstadoPago", table: "Cuotas");
        migrationBuilder.DropColumn(name: "FechaInicio", table: "Cuotas");
        migrationBuilder.DropColumn(name: "FechaVencimiento", table: "Cuotas");

        migrationBuilder.CreateIndex(
            name: "IX_Cuotas_ClienteIdCliente",
            table: "Cuotas",
            column: "ClienteIdCliente");

        migrationBuilder.CreateIndex(
            name: "IX_Cuotas_EntrenadorIdEntrenador",
            table: "Cuotas",
            column: "EntrenadorIdEntrenador");

        migrationBuilder.CreateIndex(
            name: "IX_Cuotas_ServicioIdServicio",
            table: "Cuotas",
            column: "ServicioIdServicio");

        migrationBuilder.CreateIndex(
            name: "IX_Notificaciones_ClienteIdCliente",
            table: "Notificaciones",
            column: "ClienteIdCliente");

        migrationBuilder.AddForeignKey(
            name: "FK_Cuotas_Clientes_ClienteIdCliente",
            table: "Cuotas",
            column: "ClienteIdCliente",
            principalTable: "Clientes",
            principalColumn: "IdCliente",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_Cuotas_Entrenadores_EntrenadorIdEntrenador",
            table: "Cuotas",
            column: "EntrenadorIdEntrenador",
            principalTable: "Entrenadores",
            principalColumn: "IdEntrenador");

        migrationBuilder.AddForeignKey(
            name: "FK_Cuotas_Servicios_ServicioIdServicio",
            table: "Cuotas",
            column: "ServicioIdServicio",
            principalTable: "Servicios",
            principalColumn: "IdServicio",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_Notificaciones_Clientes_ClienteIdCliente",
            table: "Notificaciones",
            column: "ClienteIdCliente",
            principalTable: "Clientes",
            principalColumn: "IdCliente",
            onDelete: ReferentialAction.Cascade);
    }
}
