namespace EcoTag.Core.DTOs.Ranking
{
    public class RankingResponseDTO
    {
        public string Periodo { get; set; } = string.Empty;

        public DateTime Inicio { get; set; }

        public DateTime Fim { get; set; }

        public List<RankingItemDTO> Itens { get; set; } = new();
    }
}
