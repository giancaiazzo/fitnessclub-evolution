using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessClubEvolution.Api.Migrations;

public partial class ImplementarCatalogoEjercicios : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            UPDATE "Ejercicios"
            SET "GrupoMuscular" = 'Sin clasificar'
            WHERE "GrupoMuscular" IS NULL OR BTRIM("GrupoMuscular") = '';
            """);

        migrationBuilder.AlterColumn<string>(
            name: "GrupoMuscular",
            table: "Ejercicios",
            type: "text",
            nullable: false,
            defaultValue: "Sin clasificar",
            oldClrType: typeof(string),
            oldType: "text",
            oldNullable: true);

        migrationBuilder.AlterColumn<bool>(
            name: "Estado",
            table: "Ejercicios",
            type: "boolean",
            nullable: false,
            defaultValue: true,
            oldClrType: typeof(bool),
            oldType: "boolean");

        migrationBuilder.AddColumn<int>(
            name: "DuracionVideoSegundos",
            table: "Ejercicios",
            type: "integer",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "FechaActualizacion",
            table: "Ejercicios",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "FechaRegistro",
            table: "Ejercicios",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "CURRENT_TIMESTAMP");

        migrationBuilder.AddColumn<byte[]>(
            name: "ImagenPreview",
            table: "Ejercicios",
            type: "bytea",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "NombreArchivoImagen",
            table: "Ejercicios",
            type: "character varying(255)",
            maxLength: 255,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "NombreArchivoVideo",
            table: "Ejercicios",
            type: "character varying(255)",
            maxLength: 255,
            nullable: true);

        migrationBuilder.AddColumn<long>(
            name: "TamanoImagenBytes",
            table: "Ejercicios",
            type: "bigint",
            nullable: true);

        migrationBuilder.AddColumn<long>(
            name: "TamanoVideoBytes",
            table: "Ejercicios",
            type: "bigint",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "TipoContenidoImagen",
            table: "Ejercicios",
            type: "character varying(50)",
            maxLength: 50,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "TipoContenidoVideo",
            table: "Ejercicios",
            type: "character varying(50)",
            maxLength: 50,
            nullable: true);

        migrationBuilder.AddColumn<byte[]>(
            name: "VideoTutorial",
            table: "Ejercicios",
            type: "bytea",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Ejercicios_GrupoMuscular_Estado",
            table: "Ejercicios",
            columns: new[] { "GrupoMuscular", "Estado" });

        migrationBuilder.CreateIndex(
            name: "IX_Ejercicios_Nombre",
            table: "Ejercicios",
            column: "Nombre");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_Ejercicios_GrupoMuscular_Estado",
            table: "Ejercicios");

        migrationBuilder.DropIndex(
            name: "IX_Ejercicios_Nombre",
            table: "Ejercicios");

        migrationBuilder.DropColumn(
            name: "DuracionVideoSegundos",
            table: "Ejercicios");

        migrationBuilder.DropColumn(
            name: "FechaActualizacion",
            table: "Ejercicios");

        migrationBuilder.DropColumn(
            name: "FechaRegistro",
            table: "Ejercicios");

        migrationBuilder.DropColumn(
            name: "ImagenPreview",
            table: "Ejercicios");

        migrationBuilder.DropColumn(
            name: "NombreArchivoImagen",
            table: "Ejercicios");

        migrationBuilder.DropColumn(
            name: "NombreArchivoVideo",
            table: "Ejercicios");

        migrationBuilder.DropColumn(
            name: "TamanoImagenBytes",
            table: "Ejercicios");

        migrationBuilder.DropColumn(
            name: "TamanoVideoBytes",
            table: "Ejercicios");

        migrationBuilder.DropColumn(
            name: "TipoContenidoImagen",
            table: "Ejercicios");

        migrationBuilder.DropColumn(
            name: "TipoContenidoVideo",
            table: "Ejercicios");

        migrationBuilder.DropColumn(
            name: "VideoTutorial",
            table: "Ejercicios");

        migrationBuilder.AlterColumn<string>(
            name: "GrupoMuscular",
            table: "Ejercicios",
            type: "text",
            nullable: true,
            oldClrType: typeof(string),
            oldType: "text",
            oldDefaultValue: "Sin clasificar");

        migrationBuilder.AlterColumn<bool>(
            name: "Estado",
            table: "Ejercicios",
            type: "boolean",
            nullable: false,
            oldClrType: typeof(bool),
            oldType: "boolean",
            oldDefaultValue: true);
    }
}
