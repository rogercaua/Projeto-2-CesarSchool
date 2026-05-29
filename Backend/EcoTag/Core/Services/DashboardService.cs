using EcoTag.Core.DTOs.Dashboard;
using EcoTag.Core.Interfaces;
using EcoTag.Data;
using Microsoft.EntityFrameworkCore;

namespace EcoTag.Core.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _context;

        public DashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardImpactoResponseDTO> GetImpactoAsync(int userId)
        {
            var now = DateTime.UtcNow;
            var startMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var startYear = new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            var query = _context.PassagensTag
                .AsNoTracking()
                .Where(passagem => passagem.Veiculo!.UsuarioId == userId);

            var mesAtual = await SumCo2Async(query.Where(passagem => passagem.DataHora >= startMonth));
            var anoAtual = await SumCo2Async(query.Where(passagem => passagem.DataHora >= startYear));
            var totalHistorico = await SumCo2Async(query);
            var totalPassagens = await query.CountAsync();

            return new DashboardImpactoResponseDTO
            {
                MesAtualKg = Math.Round(mesAtual, 6),
                AnoAtualKg = Math.Round(anoAtual, 6),
                TotalHistoricoKg = Math.Round(totalHistorico, 6),
                TotalPassagens = totalPassagens,
                PontosSustentaveis = ConvertToPoints(totalHistorico)
            };
        }

        private static async Task<double> SumCo2Async(IQueryable<Models.PassagemTagModel> query)
        {
            return await query
                .Select(passagem => (double?)passagem.Co2EvitadoKg)
                .SumAsync() ?? 0;
        }

        private static int ConvertToPoints(double totalCo2)
        {
            return (int)Math.Floor(totalCo2 * 100);
        }
    }
}
