using EcoTag.Core.DTOs.Admin;
using EcoTag.Core.DTOs.Passagens;
using EcoTag.Core.DTOs.Users;
using EcoTag.Core.DTOs.Veiculos;
using EcoTag.Models;

namespace EcoTag.Core.Mappers
{
    public static class EcoTagMapper
    {
        public static UserResponseDTO ToResponse(UserModel user)
        {
            return new UserResponseDTO
            {
                Id = user.Id,
                Nome = user.Nome,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };
        }

        public static VeiculoResponseDTO ToResponse(VeiculoModel veiculo)
        {
            return new VeiculoResponseDTO
            {
                Id = veiculo.Id,
                UsuarioId = veiculo.UsuarioId,
                TipoVeiculo = veiculo.TipoVeiculo,
                TipoCombustivel = veiculo.TipoCombustivel
            };
        }

        public static PassagemTagResponseDTO ToResponse(PassagemTagModel passagem)
        {
            return new PassagemTagResponseDTO
            {
                Id = passagem.Id,
                VeiculoId = passagem.VeiculoId,
                TipoVeiculo = passagem.Veiculo?.TipoVeiculo ?? string.Empty,
                TipoCombustivel = passagem.Veiculo?.TipoCombustivel ?? string.Empty,
                LocalUsoId = passagem.LocalUsoId,
                LocalNome = passagem.LocalUso?.Nome ?? string.Empty,
                TipoLocal = passagem.LocalUso?.TipoLocal ?? string.Empty,
                DataHora = passagem.DataHora,
                Co2EvitadoKg = passagem.Co2EvitadoKg
            };
        }

        public static FatorEmissaoResponseDTO ToResponse(FatorEmissaoModel fator)
        {
            return new FatorEmissaoResponseDTO
            {
                TipoCombustivel = fator.TipoCombustivel,
                FatorEmissao = fator.FatorEmissao,
                ConsumoMarchaLenta = fator.ConsumoMarchaLenta,
                ConsumoAdicionalAceleracao = fator.ConsumoAdicionalAceleracao
            };
        }

        public static ParametrosCenarioSemTagResponseDTO ToResponse(ParametrosCenarioSemTagModel parametros)
        {
            return new ParametrosCenarioSemTagResponseDTO
            {
                TipoLocal = parametros.TipoLocal,
                TempoMedioFilaMinutos = parametros.TempoMedioFilaMinutos,
                TempoEsperaCabineSegundos = parametros.TempoEsperaCabineSegundos,
                EmissaoTicketPapelKg = parametros.EmissaoTicketPapelKg
            };
        }

        public static LocalUsoResponseDTO ToResponse(LocalUsoModel local)
        {
            return new LocalUsoResponseDTO
            {
                Id = local.Id,
                Nome = local.Nome,
                TipoLocal = local.TipoLocal
            };
        }
    }
}
