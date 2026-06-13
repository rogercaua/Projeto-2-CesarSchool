using EcoTag.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcoTag.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260612120000_AddNomeVeiculo")]
    public partial class AddNomeVeiculo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Nome",
                table: "Veiculos",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "Veiculo cadastrado");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Nome",
                table: "Veiculos");
        }
    }
}
