using System.ComponentModel.DataAnnotations;

namespace EcoTag.Core.DTOs.Passagens
{
    public class CreatePassagemTagRequestDTO
    {
        [Range(1, int.MaxValue)]
        public int VeiculoId { get; set; }

        [Range(1, int.MaxValue)]
        public int LocalUsoId { get; set; }

        public DateTime? DataHora { get; set; }
    }
}
