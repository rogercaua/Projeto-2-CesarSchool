namespace EcoTag.Core.DTOs.Ranking
{
    public class RankingItemDTO
    {
        public int Posicao { get; set; }

        public int UserId { get; set; }

        public string Nome { get; set; } = string.Empty;

        public double Co2EvitadoKg { get; set; }

        public int PontosSustentaveis { get; set; }
    }
}
