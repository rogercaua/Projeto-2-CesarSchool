using EcoTag.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoTag.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<UserModel> Users => Set<UserModel>();

        public DbSet<VeiculoModel> Veiculos => Set<VeiculoModel>();

        public DbSet<FatorEmissaoModel> FatoresEmissao => Set<FatorEmissaoModel>();

        public DbSet<ParametrosCenarioSemTagModel> ParametrosCenarioSemTag => Set<ParametrosCenarioSemTagModel>();

        public DbSet<LocalUsoModel> LocaisUso => Set<LocalUsoModel>();

        public DbSet<PassagemTagModel> PassagensTag => Set<PassagemTagModel>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserModel>(entity =>
            {
                entity.HasIndex(user => user.Email).IsUnique();
                entity.Property(user => user.Nome).HasMaxLength(100).IsRequired();
                entity.Property(user => user.Email).HasMaxLength(150).IsRequired();
                entity.Property(user => user.PasswordHash).IsRequired();
                entity.Property(user => user.Role).HasMaxLength(30).IsRequired();
                entity.Property(user => user.CreatedAt).IsRequired();
            });

            modelBuilder.Entity<FatorEmissaoModel>(entity =>
            {
                entity.HasKey(fator => fator.TipoCombustivel);
                entity.Property(fator => fator.TipoCombustivel).HasMaxLength(30).IsRequired();
                entity.Property(fator => fator.FatorEmissao).IsRequired();
                entity.Property(fator => fator.ConsumoMarchaLenta).IsRequired();
                entity.Property(fator => fator.ConsumoAdicionalAceleracao).IsRequired();

                entity.HasData(
                    new FatorEmissaoModel
                    {
                        TipoCombustivel = "gasolina",
                        FatorEmissao = 2.31,
                        ConsumoMarchaLenta = 0.8,
                        ConsumoAdicionalAceleracao = 0.015
                    },
                    new FatorEmissaoModel
                    {
                        TipoCombustivel = "etanol",
                        FatorEmissao = 1.53,
                        ConsumoMarchaLenta = 1.0,
                        ConsumoAdicionalAceleracao = 0.018
                    },
                    new FatorEmissaoModel
                    {
                        TipoCombustivel = "diesel",
                        FatorEmissao = 2.68,
                        ConsumoMarchaLenta = 1.2,
                        ConsumoAdicionalAceleracao = 0.02
                    }
                );
            });

            modelBuilder.Entity<ParametrosCenarioSemTagModel>(entity =>
            {
                entity.HasKey(parametro => parametro.TipoLocal);
                entity.Property(parametro => parametro.TipoLocal).HasMaxLength(30).IsRequired();
                entity.Property(parametro => parametro.TempoMedioFilaMinutos).IsRequired();
                entity.Property(parametro => parametro.TempoEsperaCabineSegundos).IsRequired();
                entity.Property(parametro => parametro.EmissaoTicketPapelKg).IsRequired();

                entity.HasData(
                    new ParametrosCenarioSemTagModel
                    {
                        TipoLocal = "pedagio",
                        TempoMedioFilaMinutos = 3,
                        TempoEsperaCabineSegundos = 20,
                        EmissaoTicketPapelKg = 0.002
                    },
                    new ParametrosCenarioSemTagModel
                    {
                        TipoLocal = "estacionamento",
                        TempoMedioFilaMinutos = 2,
                        TempoEsperaCabineSegundos = 15,
                        EmissaoTicketPapelKg = 0.001
                    }
                );
            });

            modelBuilder.Entity<LocalUsoModel>(entity =>
            {
                entity.Property(local => local.Nome).HasMaxLength(100).IsRequired();
                entity.Property(local => local.TipoLocal).HasMaxLength(30).IsRequired();

                entity.HasOne(local => local.ParametrosCenario)
                    .WithMany(parametro => parametro.LocaisUso)
                    .HasForeignKey(local => local.TipoLocal)
                    .HasPrincipalKey(parametro => parametro.TipoLocal)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasData(
                    new LocalUsoModel
                    {
                        Id = 1,
                        Nome = "Pedagio Demo",
                        TipoLocal = "pedagio"
                    },
                    new LocalUsoModel
                    {
                        Id = 2,
                        Nome = "Estacionamento Demo",
                        TipoLocal = "estacionamento"
                    }
                );
            });

            modelBuilder.Entity<VeiculoModel>(entity =>
            {
                entity.Property(veiculo => veiculo.Nome).HasMaxLength(100).IsRequired();
                entity.Property(veiculo => veiculo.TipoVeiculo).HasMaxLength(30).IsRequired();
                entity.Property(veiculo => veiculo.TipoCombustivel).HasMaxLength(30).IsRequired();

                entity.HasOne(veiculo => veiculo.Usuario)
                    .WithMany(usuario => usuario.Veiculos)
                    .HasForeignKey(veiculo => veiculo.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(veiculo => veiculo.FatorEmissao)
                    .WithMany(fator => fator.Veiculos)
                    .HasForeignKey(veiculo => veiculo.TipoCombustivel)
                    .HasPrincipalKey(fator => fator.TipoCombustivel)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<PassagemTagModel>(entity =>
            {
                entity.Property(passagem => passagem.DataHora).IsRequired();
                entity.Property(passagem => passagem.Co2EvitadoKg).IsRequired();

                entity.HasOne(passagem => passagem.Veiculo)
                    .WithMany(veiculo => veiculo.Passagens)
                    .HasForeignKey(passagem => passagem.VeiculoId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(passagem => passagem.LocalUso)
                    .WithMany(local => local.Passagens)
                    .HasForeignKey(passagem => passagem.LocalUsoId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
