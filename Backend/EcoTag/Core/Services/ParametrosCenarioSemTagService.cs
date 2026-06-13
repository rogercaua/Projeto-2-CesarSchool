using EcoTag.Core.DTOs.Admin;
using EcoTag.Core.Interfaces;
using EcoTag.Core.Mappers;
using EcoTag.Core.Utils;
using EcoTag.Data;
using EcoTag.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoTag.Core.Services
{
    public class ParametrosCenarioSemTagService : IParametrosCenarioSemTagService
    {
        private readonly AppDbContext _context;

        public ParametrosCenarioSemTagService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ParametrosCenarioSemTagResponseDTO>> GetAllAsync()
        {
            var parametros = await _context.ParametrosCenarioSemTag
                .AsNoTracking()
                .OrderBy(item => item.TipoLocal)
                .ToListAsync();

            return parametros.Select(EcoTagMapper.ToResponse).ToList();
        }

        public async Task<ParametrosCenarioSemTagResponseDTO?> GetByTipoAsync(string tipoLocal)
        {
            var tipo = NormalizeTipoLocal(tipoLocal);

            var parametros = await _context.ParametrosCenarioSemTag
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.TipoLocal == tipo);

            return parametros is null ? null : EcoTagMapper.ToResponse(parametros);
        }

        public async Task<ParametrosCenarioSemTagResponseDTO> CreateAsync(ParametrosCenarioSemTagRequestDTO request)
        {
            var tipo = NormalizeTipoLocal(request.TipoLocal);

            var exists = await _context.ParametrosCenarioSemTag
                .AnyAsync(item => item.TipoLocal == tipo);

            if (exists)
            {
                throw new ArgumentException("Parametros ja cadastrados para este tipo de local.");
            }

            var parametros = new ParametrosCenarioSemTagModel
            {
                TipoLocal = tipo,
                TempoMedioFilaMinutos = request.TempoMedioFilaMinutos,
                TempoEsperaCabineSegundos = request.TempoEsperaCabineSegundos,
                EmissaoTicketPapelKg = request.EmissaoTicketPapelKg
            };

            _context.ParametrosCenarioSemTag.Add(parametros);
            await _context.SaveChangesAsync();

            return EcoTagMapper.ToResponse(parametros);
        }

        public async Task<ParametrosCenarioSemTagResponseDTO?> UpdateAsync(
            string tipoLocal,
            ParametrosCenarioSemTagRequestDTO request
        )
        {
            var tipo = NormalizeTipoLocal(tipoLocal);
            var requestTipo = NormalizeTipoLocal(request.TipoLocal);

            if (tipo != requestTipo)
            {
                throw new ArgumentException("O tipo de local da rota deve ser igual ao corpo da requisicao.");
            }

            var parametros = await _context.ParametrosCenarioSemTag
                .FirstOrDefaultAsync(item => item.TipoLocal == tipo);

            if (parametros is null)
            {
                return null;
            }

            parametros.TempoMedioFilaMinutos = request.TempoMedioFilaMinutos;
            parametros.TempoEsperaCabineSegundos = request.TempoEsperaCabineSegundos;
            parametros.EmissaoTicketPapelKg = request.EmissaoTicketPapelKg;

            await _context.SaveChangesAsync();

            return EcoTagMapper.ToResponse(parametros);
        }

        public async Task<bool> DeleteAsync(string tipoLocal)
        {
            var tipo = NormalizeTipoLocal(tipoLocal);

            var parametros = await _context.ParametrosCenarioSemTag
                .FirstOrDefaultAsync(item => item.TipoLocal == tipo);

            if (parametros is null)
            {
                return false;
            }

            if (EcoTagConstants.TiposLocal.Contains(tipo))
            {
                throw new InvalidOperationException("Parametros padrao de cenario sem tag nao podem ser excluidos. Edite os valores quando precisar ajustar as metricas.");
            }

            var inUse = await _context.LocaisUso
                .AnyAsync(item => item.TipoLocal == tipo);

            if (inUse)
            {
                throw new InvalidOperationException("Nao e possivel excluir parametros usados por locais.");
            }

            _context.ParametrosCenarioSemTag.Remove(parametros);
            await _context.SaveChangesAsync();

            return true;
        }

        private static string NormalizeTipoLocal(string tipoLocal)
        {
            var normalized = ValueNormalizer.NormalizeKey(tipoLocal);

            if (!EcoTagConstants.TiposLocal.Contains(normalized))
            {
                throw new ArgumentException("Tipo de local invalido. Use pedagio ou estacionamento.");
            }

            return normalized;
        }
    }
}
