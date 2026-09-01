using FitnessClubEvolution.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessClubEvolution.Api.Migrations;

/// <summary>
/// Incorpora el correo de recuperación a las cuentas administrativas. Las
/// columnas son inicialmente opcionales para permitir asignar las casillas de
/// Rodrigo y Paola después del despliegue sin inventar direcciones.
/// </summary>
[DbContext(typeof(AppDbContext))]
[Migration("20260901150000_AgregarCorreoRecuperacion")]
public partial class AgregarCorreoRecuperacion : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "CorreoElectronico",
            table: "Entrenadores",
            type: "character varying(254)",
            maxLength: 254,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "CorreoElectronicoNormalizado",
            table: "Entrenadores",
            type: "character varying(254)",
            maxLength: 254,
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Entrenadores_CorreoElectronicoNormalizado",
            table: "Entrenadores",
            column: "CorreoElectronicoNormalizado",
            unique: true,
            filter: "\"CorreoElectronicoNormalizado\" IS NOT NULL");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_Entrenadores_CorreoElectronicoNormalizado",
            table: "Entrenadores");

        migrationBuilder.DropColumn(
            name: "CorreoElectronico",
            table: "Entrenadores");

        migrationBuilder.DropColumn(
            name: "CorreoElectronicoNormalizado",
            table: "Entrenadores");
    }
}
