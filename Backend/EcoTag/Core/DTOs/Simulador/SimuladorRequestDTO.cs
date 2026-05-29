using System.ComponentModel.DataAnnotations;

namespace EcoTag.Core.DTOs.Simulador
{
    public class SimuladorRequestDTO
    {
        [Range(1, int.MaxValue)]
        public int VeiculoId { get; set; }

        [Range(1, int.MaxValue)]
        public int LocalUsoId { get; set; }

        [Range(1, 365)]
        public int Dias { get; set; }

        [Range(1, 1000)]
        public int PassagensPorDia { get; set; }
    }
}
