using EcoTag.Core.DTOs.Admin;
using EcoTag.Core.Interfaces;
using EcoTag.Core.Mappers;
using EcoTag.Core.Utils;
using EcoTag.Data;
using EcoTag.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoTag.Core.Services
{
    public class FatorEmissaoService : IFatorEmissaoService
    {
        private readonly AppDbContext _context;

        public FatorEmissaoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<FatorEmissaoResponseDTO>> GetAllAsync()
        {
            var fatores = await _context.FatoresEmissao
                .AsNoTracking()
                .OrderBy(item => item.TipoCombustivel)
                .ToListAsync();

            return fatores.Select(EcoTagMapper.ToResponse).ToList();
        }

        public async Task<FatorEmissaoResponseDTO?> GetByTipoAsync(string tipoCombustivel)
        {
            var tipo = NormalizeTipoCombustivel(tipoCombustivel);

            var fator = await _context.FatoresEmissao
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.TipoCombustivel == tipo);

            return fator is null ? null : EcoTagMapper.ToResponse(fator);
        }

        public async Task<FatorEmissaoResponseDTO> CreateAsync(FatorEmissaoRequestDTO request)
        {
            var tipo = NormalizeTipoCombustivel(request.TipoCombustivel);

            var exists = await _context.FatoresEmissao
                .AnyAsync(item => item.TipoCombustivel == tipo);

            if (exists)
            {
                throw new ArgumentException("Fator de emissao ja cadastrado para este combustivel.");
            }

            var fator = new FatorEmissaoModel
            {
                TipoCombustivel = tipo,
                FatorEmissao = request.FatorEmissao,
                ConsumoMarchaLenta = request.ConsumoMarchaLenta,
                ConsumoAdicionalAceleracao = request.ConsumoAdicionalAceleracao
            };

            _context.FatoresEmissao.Add(fator);
            await _context.SaveChangesAsync();

            return EcoTagMapper.ToResponse(fator);
        }

        public async Task<FatorEmissaoResponseDTO?> UpdateAsync(string tipoCombustivel, FatorEmissaoRequestDTO request)
        {
            var tipo = NormalizeTipoCombustivel(tipoCombustivel);
            var requestTipo = NormalizeTipoCombustivel(request.TipoCombustivel);

            if (tipo != requestTipo)
            {
                throw new ArgumentException("O tipo de combustivel da rota deve ser igual ao corpo da requisicao.");
            }

            var fator = await _context.FatoresEmissao
                .FirstOrDefaultAsync(item => item.TipoCombustivel == tipo);

            if (fator is null)
            {
                return null;
            }

            fator.FatorEmissao = request.FatorEmissao;
            fator.ConsumoMarchaLenta = request.ConsumoMarchaLenta;
            fator.ConsumoAdicionalAceleracao = request.ConsumoAdicionalAceleracao;

            await _context.SaveChangesAsync();

            return EcoTagMapper.ToResponse(fator);
        }

        public async Task<bool> DeleteAsync(string tipoCombustivel)
        {
            var tipo = NormalizeTipoCombustivel(tipoCombustivel);

            var fator = await _context.FatoresEmissao
                .FirstOrDefaultAsync(item => item.TipoCombustivel == tipo);

            if (fator is null)
            {
                return false;
            }

            var inUse = await _context.Veiculos
                .AnyAsync(item => item.TipoCombustivel == tipo);

            if (inUse)
            {
                throw new InvalidOperationException("Nao e possivel excluir um fator usado por veiculos.");
            }

            _context.FatoresEmissao.Remove(fator);
            await _context.SaveChangesAsync();

            return true;
        }

        private static string NormalizeTipoCombustivel(string tipoCombustivel)
        {
            var normalized = ValueNormalizer.NormalizeKey(tipoCombustivel);

            if (!EcoTagConstants.TiposCombustivel.Contains(normalized))
            {
                throw new ArgumentException("Tipo de combustivel invalido. Use gasolina, etanol ou diesel.");
            }

            return normalized;
        }
    }
}
