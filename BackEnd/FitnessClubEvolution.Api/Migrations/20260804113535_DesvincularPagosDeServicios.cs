using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessClubEvolution.Api.Migrations
{
    /// <inheritdoc />
    public partial class DesvincularPagosDeServicios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cuotas_Servicios_IdServicio",
                table: "Cuotas");

            migrationBuilder.DropIndex(
                name: "IX_Cuotas_IdServicio",
                table: "Cuotas");

            migrationBuilder.DropColumn(
                name: "IdServicio",
                table: "Cuotas");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdServicio",
                table: "Cuotas",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Cuotas_IdServicio",
                table: "Cuotas",
                column: "IdServicio");

            migrationBuilder.AddForeignKey(
                name: "FK_Cuotas_Servicios_IdServicio",
                table: "Cuotas",
                column: "IdServicio",
                principalTable: "Servicios",
                principalColumn: "IdServicio",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
