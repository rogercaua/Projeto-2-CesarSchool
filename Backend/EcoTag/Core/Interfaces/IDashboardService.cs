using EcoTag.Core.DTOs.Dashboard;

namespace EcoTag.Core.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardImpactoResponseDTO> GetImpactoAsync(int userId);
    }
}
