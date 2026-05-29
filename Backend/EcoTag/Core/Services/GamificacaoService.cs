using EcoTag.Core.DTOs.Gamificacao;
using EcoTag.Core.Interfaces;
using EcoTag.Core.Utils;
using EcoTag.Data;
using Microsoft.EntityFrameworkCore;

namespace EcoTag.Core.Services
{
    public class GamificacaoService : IGamificacaoService
    {
        private readonly AppDbContext _context;

        public GamificacaoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<GamificacaoResponseDTO> GetAsync(int userId)
        {
            var totalCo2 = await _context.PassagensTag
                .AsNoTracking()
                .Where(passagem => passagem.Veiculo!.UsuarioId == userId)
                .Select(passagem => (double?)passagem.Co2EvitadoKg)
                .SumAsync() ?? 0;

            return new GamificacaoResponseDTO
            {
                TotalCo2EvitadoKg = Math.Round(totalCo2, 6),
                PontosSustentaveis = (int)Math.Floor(totalCo2 * 100),
                Selos = EcoTagConstants.Selos
                    .Select(selo => new SeloDTO
                    {
                        Nome = selo.Nome,
                        MarcoKg = selo.MarcoKg,
                        Desbloqueado = totalCo2 >= selo.MarcoKg
                    })
                    .ToList()
            };
        }
    }
}
