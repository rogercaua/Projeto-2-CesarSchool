namespace EcoTag.Core.DTOs.Passagens
{
    public class PassagemTagResponseDTO
    {
        public int Id { get; set; }

        public int VeiculoId { get; set; }

        public string VeiculoNome { get; set; } = string.Empty;

        public string TipoVeiculo { get; set; } = string.Empty;

        public string TipoCombustivel { get; set; } = string.Empty;

        public int LocalUsoId { get; set; }

        public string LocalNome { get; set; } = string.Empty;

        public string TipoLocal { get; set; } = string.Empty;

        public DateTime DataHora { get; set; }

        public double Co2EvitadoKg { get; set; }
    }
}
