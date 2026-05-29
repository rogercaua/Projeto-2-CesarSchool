using System.ComponentModel.DataAnnotations;

namespace EcoTag.Core.DTOs.Admin
{
    public class FatorEmissaoRequestDTO
    {
        [Required]
        [MaxLength(30)]
        public string TipoCombustivel { get; set; } = string.Empty;

        [Range(0.000001, double.MaxValue)]
        public double FatorEmissao { get; set; }

        [Range(0, double.MaxValue)]
        public double ConsumoMarchaLenta { get; set; }

        [Range(0, double.MaxValue)]
        public double ConsumoAdicionalAceleracao { get; set; }
    }
}
