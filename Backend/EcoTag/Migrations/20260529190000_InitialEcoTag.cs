using System;
using EcoTag.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EcoTag.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260529190000_InitialEcoTag")]
    public partial class InitialEcoTag : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FatoresEmissao",
                columns: table => new
                {
                    TipoCombustivel = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    FatorEmissao = table.Column<double>(type: "double precision", nullable: false),
                    ConsumoMarchaLenta = table.Column<double>(type: "double precision", nullable: false),
                    ConsumoAdicionalAceleracao = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FatoresEmissao", x => x.TipoCombustivel);
                });

            migrationBuilder.CreateTable(
                name: "ParametrosCenarioSemTag",
                columns: table => new
                {
                    TipoLocal = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    TempoMedioFilaMinutos = table.Column<int>(type: "integer", nullable: false),
                    TempoEsperaCabineSegundos = table.Column<int>(type: "integer", nullable: false),
                    EmissaoTicketPapelKg = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParametrosCenarioSemTag", x => x.TipoLocal);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LocaisUso",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TipoLocal = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocaisUso", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LocaisUso_ParametrosCenarioSemTag_TipoLocal",
                        column: x => x.TipoLocal,
                        principalTable: "ParametrosCenarioSemTag",
                        principalColumn: "TipoLocal",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Veiculos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    TipoVeiculo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    TipoCombustivel = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Veiculos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Veiculos_FatoresEmissao_TipoCombustivel",
                        column: x => x.TipoCombustivel,
                        principalTable: "FatoresEmissao",
                        principalColumn: "TipoCombustivel",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Veiculos_Users_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PassagensTag",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VeiculoId = table.Column<int>(type: "integer", nullable: false),
                    LocalUsoId = table.Column<int>(type: "integer", nullable: false),
                    DataHora = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Co2EvitadoKg = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PassagensTag", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PassagensTag_LocaisUso_LocalUsoId",
                        column: x => x.LocalUsoId,
                        principalTable: "LocaisUso",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PassagensTag_Veiculos_VeiculoId",
                        column: x => x.VeiculoId,
                        principalTable: "Veiculos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql("""
                INSERT INTO "FatoresEmissao"
                    ("TipoCombustivel", "ConsumoAdicionalAceleracao", "ConsumoMarchaLenta", "FatorEmissao")
                VALUES
                    ('diesel', 0.02, 1.2, 2.68),
                    ('etanol', 0.018, 1.0, 1.53),
                    ('gasolina', 0.015, 0.8, 2.31)
                ON CONFLICT ("TipoCombustivel") DO NOTHING;
                """);

            migrationBuilder.Sql("""
                INSERT INTO "ParametrosCenarioSemTag"
                    ("TipoLocal", "EmissaoTicketPapelKg", "TempoEsperaCabineSegundos", "TempoMedioFilaMinutos")
                VALUES
                    ('estacionamento', 0.001, 15, 2),
                    ('pedagio', 0.002, 20, 3)
                ON CONFLICT ("TipoLocal") DO NOTHING;
                """);

            migrationBuilder.Sql("""
                INSERT INTO "LocaisUso"
                    ("Id", "Nome", "TipoLocal")
                VALUES
                    (1, 'Pedagio Demo', 'pedagio'),
                    (2, 'Estacionamento Demo', 'estacionamento')
                ON CONFLICT ("Id") DO NOTHING;

                SELECT setval(
                    pg_get_serial_sequence('"LocaisUso"', 'Id'),
                    GREATEST((SELECT COALESCE(MAX("Id"), 1) FROM "LocaisUso"), 1)
                );
                """);

            migrationBuilder.CreateIndex(
                name: "IX_LocaisUso_TipoLocal",
                table: "LocaisUso",
                column: "TipoLocal");

            migrationBuilder.CreateIndex(
                name: "IX_PassagensTag_LocalUsoId",
                table: "PassagensTag",
                column: "LocalUsoId");

            migrationBuilder.CreateIndex(
                name: "IX_PassagensTag_VeiculoId",
                table: "PassagensTag",
                column: "VeiculoId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Veiculos_TipoCombustivel",
                table: "Veiculos",
                column: "TipoCombustivel");

            migrationBuilder.CreateIndex(
                name: "IX_Veiculos_UsuarioId",
                table: "Veiculos",
                column: "UsuarioId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "PassagensTag");
            migrationBuilder.DropTable(name: "LocaisUso");
            migrationBuilder.DropTable(name: "Veiculos");
            migrationBuilder.DropTable(name: "ParametrosCenarioSemTag");
            migrationBuilder.DropTable(name: "FatoresEmissao");
            migrationBuilder.DropTable(name: "Users");
        }
    }
}
