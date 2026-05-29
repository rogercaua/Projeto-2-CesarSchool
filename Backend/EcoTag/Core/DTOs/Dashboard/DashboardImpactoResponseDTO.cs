namespace EcoTag.Core.DTOs.Dashboard
{
    public class DashboardImpactoResponseDTO
    {
        public double MesAtualKg { get; set; }

        public double AnoAtualKg { get; set; }

        public double TotalHistoricoKg { get; set; }

        public int TotalPassagens { get; set; }

        public int PontosSustentaveis { get; set; }
    }
}
