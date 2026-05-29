using EcoTag.Core.DTOs.Ranking;

namespace EcoTag.Core.Interfaces
{
    public interface IRankingService
    {
        Task<RankingResponseDTO> GetAsync(string periodo, int limit);
    }
}
