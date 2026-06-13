namespace EcoTag.Core.DTOs.Veiculos
{
    public class VeiculoResponseDTO
    {
        public int Id { get; set; }

        public int UsuarioId { get; set; }

        public string Nome { get; set; } = string.Empty;

        public string TipoVeiculo { get; set; } = string.Empty;

        public string TipoCombustivel { get; set; } = string.Empty;
    }
}
