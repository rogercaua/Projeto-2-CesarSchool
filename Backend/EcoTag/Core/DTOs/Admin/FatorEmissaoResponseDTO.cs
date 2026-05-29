namespace EcoTag.Core.DTOs.Admin
{
    public class FatorEmissaoResponseDTO
    {
        public string TipoCombustivel { get; set; } = string.Empty;

        public double FatorEmissao { get; set; }

        public double ConsumoMarchaLenta { get; set; }

        public double ConsumoAdicionalAceleracao { get; set; }
    }
}
