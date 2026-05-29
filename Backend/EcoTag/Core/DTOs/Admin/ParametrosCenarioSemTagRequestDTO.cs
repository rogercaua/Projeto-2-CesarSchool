using System.ComponentModel.DataAnnotations;

namespace EcoTag.Core.DTOs.Admin
{
    public class ParametrosCenarioSemTagRequestDTO
    {
        [Required]
        [MaxLength(30)]
        public string TipoLocal { get; set; } = string.Empty;

        [Range(0, 240)]
        public int TempoMedioFilaMinutos { get; set; }

        [Range(0, 3600)]
        public int TempoEsperaCabineSegundos { get; set; }

        [Range(0, double.MaxValue)]
        public double EmissaoTicketPapelKg { get; set; }
    }
}
