using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessClubEvolution.Api.Migrations
{
    /// <inheritdoc />
    public partial class ImplementarServiciosYRutinas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Foto",
                table: "Servicios",
                newName: "NombreArchivoImagen");

            // Se conserva cualquier ruta antigua para no perder información.
            // Las rutinas nuevas ya almacenan el PDF dentro de PostgreSQL.
            migrationBuilder.RenameColumn(
                name: "RutaPdf",
                table: "Rutinas",
                newName: "RutaPdfAnterior");

            migrationBuilder.AlterColumn<decimal>(
                name: "Precio",
                table: "Servicios",
                type: "numeric(12,2)",
                precision: 12,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Servicios",
                type: "character varying(80)",
                maxLength: 80,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "NombreArchivoImagen",
                table: "Servicios",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Duracion",
                table: "Servicios",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "Servicios",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "Imagen",
                table: "Servicios",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TipoContenidoImagen",
                table: "Servicios",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NombreArchivoPdf",
                table: "Rutinas",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Rutinas",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "Rutinas",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RutaPdfAnterior",
                table: "Rutinas",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<int>(
                name: "CantidadPaginas",
                table: "Rutinas",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "ContenidoPdf",
                table: "Rutinas",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "TamanoBytes",
                table: "Rutinas",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TipoContenidoPdf",
                table: "Rutinas",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Servicios_Nombre",
                table: "Servicios",
                column: "Nombre");

            migrationBuilder.CreateIndex(
                name: "IX_Rutinas_Nombre",
                table: "Rutinas",
                column: "Nombre");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Servicios_Nombre",
                table: "Servicios");

            migrationBuilder.DropIndex(
                name: "IX_Rutinas_Nombre",
                table: "Rutinas");

            migrationBuilder.DropColumn(
                name: "Imagen",
                table: "Servicios");

            migrationBuilder.DropColumn(
                name: "TipoContenidoImagen",
                table: "Servicios");

            migrationBuilder.DropColumn(
                name: "CantidadPaginas",
                table: "Rutinas");

            migrationBuilder.DropColumn(
                name: "ContenidoPdf",
                table: "Rutinas");

            migrationBuilder.DropColumn(
                name: "TamanoBytes",
                table: "Rutinas");

            migrationBuilder.DropColumn(
                name: "TipoContenidoPdf",
                table: "Rutinas");

            migrationBuilder.AlterColumn<decimal>(
                name: "Precio",
                table: "Servicios",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(12,2)",
                oldPrecision: 12,
                oldScale: 2);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Servicios",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(80)",
                oldMaxLength: 80);

            migrationBuilder.AlterColumn<string>(
                name: "Duracion",
                table: "Servicios",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "Servicios",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NombreArchivoImagen",
                table: "Servicios",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.RenameColumn(
                name: "NombreArchivoImagen",
                table: "Servicios",
                newName: "Foto");

            migrationBuilder.AlterColumn<string>(
                name: "NombreArchivoPdf",
                table: "Rutinas",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Rutinas",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "Rutinas",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.Sql(
                """
                UPDATE "Rutinas"
                SET "RutaPdfAnterior" = ''
                WHERE "RutaPdfAnterior" IS NULL;
                """);

            migrationBuilder.AlterColumn<string>(
                name: "RutaPdfAnterior",
                table: "Rutinas",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.RenameColumn(
                name: "RutaPdfAnterior",
                table: "Rutinas",
                newName: "RutaPdf");
        }
    }
}
