namespace EcoTag.Core.DTOs.Admin
{
    public class ParametrosCenarioSemTagResponseDTO
    {
        public string TipoLocal { get; set; } = string.Empty;

        public int TempoMedioFilaMinutos { get; set; }

        public int TempoEsperaCabineSegundos { get; set; }

        public double EmissaoTicketPapelKg { get; set; }
    }
}
