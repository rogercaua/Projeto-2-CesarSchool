using EcoTag.Core.DTOs.Passagens;
using EcoTag.Core.Interfaces;
using EcoTag.Core.Mappers;
using EcoTag.Data;
using EcoTag.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoTag.Core.Services
{
    public class PassagemService : IPassagemService
    {
        private readonly AppDbContext _context;
        private readonly ICalculoEmissaoService _calculoEmissaoService;

        public PassagemService(
            AppDbContext context,
            ICalculoEmissaoService calculoEmissaoService
        )
        {
            _context = context;
            _calculoEmissaoService = calculoEmissaoService;
        }

        public async Task<List<PassagemTagResponseDTO>> GetByUserAsync(int userId)
        {
            var passagens = await _context.PassagensTag
                .AsNoTracking()
                .Include(passagem => passagem.Veiculo)
                .Include(passagem => passagem.LocalUso)
                .Where(passagem => passagem.Veiculo!.UsuarioId == userId)
                .OrderByDescending(passagem => passagem.DataHora)
                .ToListAsync();

            return passagens.Select(EcoTagMapper.ToResponse).ToList();
        }

        public async Task<PassagemTagResponseDTO> CreateAsync(int userId, CreatePassagemTagRequestDTO request)
        {
            var veiculo = await _context.Veiculos
                .FirstOrDefaultAsync(item => item.Id == request.VeiculoId && item.UsuarioId == userId);

            if (veiculo is null)
            {
                throw new KeyNotFoundException("Veiculo nao encontrado para este usuario.");
            }

            var localUso = await _context.LocaisUso
                .FirstOrDefaultAsync(item => item.Id == request.LocalUsoId);

            if (localUso is null)
            {
                throw new KeyNotFoundException("Local de uso nao encontrado.");
            }

            var co2EvitadoKg = await _calculoEmissaoService
                .CalcularCo2EvitadoAsync(veiculo.TipoCombustivel, localUso.TipoLocal);

            var passagem = new PassagemTagModel
            {
                VeiculoId = veiculo.Id,
                LocalUsoId = localUso.Id,
                DataHora = NormalizeDate(request.DataHora),
                Co2EvitadoKg = co2EvitadoKg,
                Veiculo = veiculo,
                LocalUso = localUso
            };

            _context.PassagensTag.Add(passagem);
            await _context.SaveChangesAsync();

            return EcoTagMapper.ToResponse(passagem);
        }

        private static DateTime NormalizeDate(DateTime? dateTime)
        {
            if (!dateTime.HasValue)
            {
                return DateTime.UtcNow;
            }

            return dateTime.Value.Kind switch
            {
                DateTimeKind.Local => dateTime.Value.ToUniversalTime(),
                DateTimeKind.Utc => dateTime.Value,
                _ => DateTime.SpecifyKind(dateTime.Value, DateTimeKind.Utc)
            };
        }
    }
}
