using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessClubEvolution.Api.Migrations;

public partial class VincularClientesConRutinas : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Se agrega primero como nullable para poder migrar bases que ya tienen
        // clientes. El sistema anterior recibía una rutina, pero no la guardaba.
        migrationBuilder.AddColumn<int>(
            name: "IdRutina",
            table: "Clientes",
            type: "integer",
            nullable: true);

        // No es seguro adivinar qué rutina tenía cada cliente existente. Se crea
        // una opción claramente identificable y luego el administrador puede
        // reemplazarla desde Modificar cliente.
        migrationBuilder.Sql(
            """
            DO $migration$
            DECLARE
                rutina_pendiente_id integer;
            BEGIN
                IF EXISTS (SELECT 1 FROM "Clientes" WHERE "IdRutina" IS NULL) THEN
                    SELECT "IdRutina"
                    INTO rutina_pendiente_id
                    FROM "Rutinas"
                    WHERE "Nombre" = 'Pendiente de reasignación'
                      AND "Descripcion" = '[MIGRACION-CLIENTE-RUTINA] Asigná una rutina real desde el listado de clientes.'
                    ORDER BY "IdRutina"
                    LIMIT 1;

                    IF rutina_pendiente_id IS NULL THEN
                        INSERT INTO "Rutinas" (
                            "Nombre",
                            "Descripcion",
                            "NombreArchivoPdf",
                            "TipoContenidoPdf",
                            "ContenidoPdf",
                            "CantidadPaginas",
                            "TamanoBytes",
                            "FechaCarga")
                        VALUES (
                            'Pendiente de reasignación',
                            '[MIGRACION-CLIENTE-RUTINA] Asigná una rutina real desde el listado de clientes.',
                            'pendiente-reasignacion.pdf',
                            NULL,
                            NULL,
                            NULL,
                            NULL,
                            CURRENT_TIMESTAMP)
                        RETURNING "IdRutina" INTO rutina_pendiente_id;
                    END IF;

                    UPDATE "Clientes"
                    SET "IdRutina" = rutina_pendiente_id
                    WHERE "IdRutina" IS NULL;
                END IF;
            END;
            $migration$;
            """);

        migrationBuilder.AlterColumn<int>(
            name: "IdRutina",
            table: "Clientes",
            type: "integer",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Clientes_IdRutina",
            table: "Clientes",
            column: "IdRutina");

        migrationBuilder.AddForeignKey(
            name: "FK_Clientes_Rutinas_IdRutina",
            table: "Clientes",
            column: "IdRutina",
            principalTable: "Rutinas",
            principalColumn: "IdRutina",
            onDelete: ReferentialAction.Restrict);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Clientes_Rutinas_IdRutina",
            table: "Clientes");

        migrationBuilder.DropIndex(
            name: "IX_Clientes_IdRutina",
            table: "Clientes");

        migrationBuilder.DropColumn(
            name: "IdRutina",
            table: "Clientes");

        migrationBuilder.Sql(
            """
            DELETE FROM "Rutinas"
            WHERE "Nombre" = 'Pendiente de reasignación'
              AND "Descripcion" = '[MIGRACION-CLIENTE-RUTINA] Asigná una rutina real desde el listado de clientes.'
              AND "ContenidoPdf" IS NULL;
            """);
    }
}
