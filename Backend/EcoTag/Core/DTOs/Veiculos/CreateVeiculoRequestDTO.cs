using System.ComponentModel.DataAnnotations;

namespace EcoTag.Core.DTOs.Veiculos
{
    public class CreateVeiculoRequestDTO
    {
        [Required]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public string TipoVeiculo { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public string TipoCombustivel { get; set; } = string.Empty;
    }
}
