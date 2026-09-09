using System;
using FitnessClubEvolution.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessClubEvolution.Api.Migrations;

/// <summary>
/// Vincula opcionalmente cada cliente con el employeeNo del controlador y
/// conserva la auditoría del último resultado de sincronización.
/// </summary>
[DbContext(typeof(AppDbContext))]
[Migration("20260909130000_IntegrarAccesoHikvision")]
public partial class IntegrarAccesoHikvision : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "AccesoHikvisionHabilitado",
            table: "Clientes",
            type: "boolean",
            nullable: true);

        migrationBuilder.AddColumn<DateOnly>(
            name: "FechaVencimientoAccesoHikvision",
            table: "Clientes",
            type: "date",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "FechaUltimaSincronizacionHikvision",
            table: "Clientes",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "HikvisionEmployeeNo",
            table: "Clientes",
            type: "character varying(32)",
            maxLength: 32,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "UltimoErrorHikvision",
            table: "Clientes",
            type: "character varying(1000)",
            maxLength: 1000,
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Clientes_HikvisionEmployeeNo",
            table: "Clientes",
            column: "HikvisionEmployeeNo",
            unique: true,
            filter: "\"HikvisionEmployeeNo\" IS NOT NULL");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_Clientes_HikvisionEmployeeNo",
            table: "Clientes");

        migrationBuilder.DropColumn(
            name: "AccesoHikvisionHabilitado",
            table: "Clientes");

        migrationBuilder.DropColumn(
            name: "FechaVencimientoAccesoHikvision",
            table: "Clientes");

        migrationBuilder.DropColumn(
            name: "FechaUltimaSincronizacionHikvision",
            table: "Clientes");

        migrationBuilder.DropColumn(
            name: "HikvisionEmployeeNo",
            table: "Clientes");

        migrationBuilder.DropColumn(
            name: "UltimoErrorHikvision",
            table: "Clientes");
    }
}
