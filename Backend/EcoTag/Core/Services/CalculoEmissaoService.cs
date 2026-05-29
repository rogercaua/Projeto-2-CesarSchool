using EcoTag.Core.Interfaces;
using EcoTag.Core.Utils;
using EcoTag.Data;
using Microsoft.EntityFrameworkCore;

namespace EcoTag.Core.Services
{
    public class CalculoEmissaoService : ICalculoEmissaoService
    {
        private readonly AppDbContext _context;

        public CalculoEmissaoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<double> CalcularCo2EvitadoAsync(string tipoCombustivel, string tipoLocal)
        {
            var combustivel = ValueNormalizer.NormalizeKey(tipoCombustivel);
            var local = ValueNormalizer.NormalizeKey(tipoLocal);

            var fator = await _context.FatoresEmissao
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.TipoCombustivel == combustivel);

            if (fator is null)
            {
                throw new InvalidOperationException("Fator de emissao nao encontrado para o combustivel informado.");
            }

            var parametros = await _context.ParametrosCenarioSemTag
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.TipoLocal == local);

            if (parametros is null)
            {
                throw new InvalidOperationException("Parametros ambientais nao encontrados para o local informado.");
            }

            var tempoParadoHoras =
                ((parametros.TempoMedioFilaMinutos * 60.0) + parametros.TempoEsperaCabineSegundos) / 3600.0;

            var litrosEvitados =
                (fator.ConsumoMarchaLenta * tempoParadoHoras) + fator.ConsumoAdicionalAceleracao;

            var co2EvitadoKg =
                (litrosEvitados * fator.FatorEmissao) + parametros.EmissaoTicketPapelKg;

            return Math.Round(co2EvitadoKg, 6, MidpointRounding.AwayFromZero);
        }
    }
}
