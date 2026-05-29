namespace EcoTag.Core.DTOs.Simulador
{
    public class SimuladorResponseDTO
    {
        public int Dias { get; set; }

        public int PassagensPorDia { get; set; }

        public int TotalPassagens { get; set; }

        public double Co2EvitadoPorPassagemKg { get; set; }

        public double Co2EvitadoTotalKg { get; set; }

        public double Co2EmitidoAMaisSemTagKg { get; set; }
    }
}
