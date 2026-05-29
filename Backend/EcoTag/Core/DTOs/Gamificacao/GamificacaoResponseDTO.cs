namespace EcoTag.Core.DTOs.Gamificacao
{
    public class GamificacaoResponseDTO
    {
        public double TotalCo2EvitadoKg { get; set; }

        public int PontosSustentaveis { get; set; }

        public List<SeloDTO> Selos { get; set; } = new();
    }
}
