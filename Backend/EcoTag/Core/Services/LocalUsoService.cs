using EcoTag.Core.DTOs.Admin;
using EcoTag.Core.Interfaces;
using EcoTag.Core.Mappers;
using EcoTag.Core.Utils;
using EcoTag.Data;
using EcoTag.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoTag.Core.Services
{
    public class LocalUsoService : ILocalUsoService
    {
        private readonly AppDbContext _context;

        public LocalUsoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<LocalUsoResponseDTO>> GetAllAsync()
        {
            var locais = await _context.LocaisUso
                .AsNoTracking()
                .OrderBy(item => item.Nome)
                .ToListAsync();

            return locais.Select(EcoTagMapper.ToResponse).ToList();
        }

        public async Task<LocalUsoResponseDTO?> GetByIdAsync(int id)
        {
            var local = await _context.LocaisUso
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == id);

            return local is null ? null : EcoTagMapper.ToResponse(local);
        }

        public async Task<LocalUsoResponseDTO> CreateAsync(LocalUsoRequestDTO request)
        {
            var tipoLocal = await NormalizeTipoLocalAsync(request.TipoLocal);

            var local = new LocalUsoModel
            {
                Nome = request.Nome.Trim(),
                TipoLocal = tipoLocal
            };

            _context.LocaisUso.Add(local);
            await _context.SaveChangesAsync();

            return EcoTagMapper.ToResponse(local);
        }

        public async Task<LocalUsoResponseDTO?> UpdateAsync(int id, LocalUsoRequestDTO request)
        {
            var local = await _context.LocaisUso
                .FirstOrDefaultAsync(item => item.Id == id);

            if (local is null)
            {
                return null;
            }

            local.Nome = request.Nome.Trim();
            local.TipoLocal = await NormalizeTipoLocalAsync(request.TipoLocal);

            await _context.SaveChangesAsync();

            return EcoTagMapper.ToResponse(local);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var local = await _context.LocaisUso
                .FirstOrDefaultAsync(item => item.Id == id);

            if (local is null)
            {
                return false;
            }

            var inUse = await _context.PassagensTag
                .AnyAsync(item => item.LocalUsoId == id);

            if (inUse)
            {
                throw new InvalidOperationException("Nao e possivel excluir um local com passagens registradas.");
            }

            _context.LocaisUso.Remove(local);
            await _context.SaveChangesAsync();

            return true;
        }

        private async Task<string> NormalizeTipoLocalAsync(string tipoLocal)
        {
            var normalized = ValueNormalizer.NormalizeKey(tipoLocal);

            if (!EcoTagConstants.TiposLocal.Contains(normalized))
            {
                throw new ArgumentException("Tipo de local invalido. Use pedagio ou estacionamento.");
            }

            var exists = await _context.ParametrosCenarioSemTag
                .AnyAsync(item => item.TipoLocal == normalized);

            if (!exists)
            {
                throw new InvalidOperationException("Nao existem parametros cadastrados para este tipo de local.");
            }

            return normalized;
        }
    }
}
