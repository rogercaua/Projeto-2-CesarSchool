using EcoTag.Core.DTOs.Ranking;
using EcoTag.Core.Interfaces;
using EcoTag.Core.Utils;
using EcoTag.Data;
using Microsoft.EntityFrameworkCore;

namespace EcoTag.Core.Services
{
    public class RankingService : IRankingService
    {
        private readonly AppDbContext _context;

        public RankingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<RankingResponseDTO> GetAsync(string periodo, int limit)
        {
            var normalizedPeriod = ValueNormalizer.NormalizeKey(periodo);

            if (normalizedPeriod != "mensal")
            {
                throw new ArgumentException("Periodo invalido. Use mensal.");
            }

            var safeLimit = Math.Clamp(limit, 1, 100);
            var now = DateTime.UtcNow;
            var inicio = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var fim = inicio.AddMonths(1);

            var rawItems = await _context.PassagensTag
                .AsNoTracking()
                .Where(passagem => passagem.DataHora >= inicio && passagem.DataHora < fim)
                .GroupBy(passagem => new
                {
                    UserId = passagem.Veiculo!.UsuarioId,
                    Nome = passagem.Veiculo!.Usuario!.Nome
                })
                .Select(group => new
                {
                    group.Key.UserId,
                    group.Key.Nome,
                    Co2EvitadoKg = group.Sum(passagem => passagem.Co2EvitadoKg)
                })
                .OrderByDescending(item => item.Co2EvitadoKg)
                .ThenBy(item => item.Nome)
                .Take(safeLimit)
                .ToListAsync();

            var items = rawItems
                .Select((item, index) => new RankingItemDTO
                {
                    Posicao = index + 1,
                    UserId = item.UserId,
                    Nome = item.Nome,
                    Co2EvitadoKg = Math.Round(item.Co2EvitadoKg, 6),
                    PontosSustentaveis = (int)Math.Floor(item.Co2EvitadoKg * 100)
                })
                .ToList();

            return new RankingResponseDTO
            {
                Periodo = normalizedPeriod,
                Inicio = inicio,
                Fim = fim,
                Itens = items
            };
        }
    }
}
