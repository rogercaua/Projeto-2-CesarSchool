using EcoTag.Core.DTOs.Veiculos;
using EcoTag.Core.Interfaces;
using EcoTag.Core.Mappers;
using EcoTag.Core.Utils;
using EcoTag.Data;
using EcoTag.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoTag.Core.Services
{
    public class VeiculoService : IVeiculoService
    {
        private readonly AppDbContext _context;

        public VeiculoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<VeiculoResponseDTO>> GetByUserAsync(int userId)
        {
            var veiculos = await _context.Veiculos
                .AsNoTracking()
                .Where(veiculo => veiculo.UsuarioId == userId)
                .OrderBy(veiculo => veiculo.Id)
                .ToListAsync();

            return veiculos.Select(EcoTagMapper.ToResponse).ToList();
        }

        public async Task<VeiculoResponseDTO> CreateAsync(int userId, CreateVeiculoRequestDTO request)
        {
            var tipoVeiculo = NormalizeTipoVeiculo(request.TipoVeiculo);
            var tipoCombustivel = await NormalizeTipoCombustivelAsync(request.TipoCombustivel);

            var veiculo = new VeiculoModel
            {
                UsuarioId = userId,
                TipoVeiculo = tipoVeiculo,
                TipoCombustivel = tipoCombustivel
            };

            _context.Veiculos.Add(veiculo);
            await _context.SaveChangesAsync();

            return EcoTagMapper.ToResponse(veiculo);
        }

        public async Task<VeiculoResponseDTO?> UpdateAsync(int userId, int id, UpdateVeiculoRequestDTO request)
        {
            var veiculo = await _context.Veiculos
                .FirstOrDefaultAsync(item => item.Id == id && item.UsuarioId == userId);

            if (veiculo is null)
            {
                return null;
            }

            veiculo.TipoVeiculo = NormalizeTipoVeiculo(request.TipoVeiculo);
            veiculo.TipoCombustivel = await NormalizeTipoCombustivelAsync(request.TipoCombustivel);

            await _context.SaveChangesAsync();

            return EcoTagMapper.ToResponse(veiculo);
        }

        public async Task<bool> DeleteAsync(int userId, int id)
        {
            var veiculo = await _context.Veiculos
                .FirstOrDefaultAsync(item => item.Id == id && item.UsuarioId == userId);

            if (veiculo is null)
            {
                return false;
            }

            _context.Veiculos.Remove(veiculo);
            await _context.SaveChangesAsync();

            return true;
        }

        private static string NormalizeTipoVeiculo(string tipoVeiculo)
        {
            var normalized = ValueNormalizer.NormalizeKey(tipoVeiculo);

            if (!EcoTagConstants.TiposVeiculo.Contains(normalized))
            {
                throw new ArgumentException("Tipo de veiculo invalido. Use carro, moto ou caminhao.");
            }

            return normalized;
        }

        private async Task<string> NormalizeTipoCombustivelAsync(string tipoCombustivel)
        {
            var normalized = ValueNormalizer.NormalizeKey(tipoCombustivel);

            if (!EcoTagConstants.TiposCombustivel.Contains(normalized))
            {
                throw new ArgumentException("Tipo de combustivel invalido. Use gasolina, etanol ou diesel.");
            }

            var exists = await _context.FatoresEmissao
                .AnyAsync(item => item.TipoCombustivel == normalized);

            if (!exists)
            {
                throw new InvalidOperationException("Nao existe fator de emissao cadastrado para este combustivel.");
            }

            return normalized;
        }
    }
}
