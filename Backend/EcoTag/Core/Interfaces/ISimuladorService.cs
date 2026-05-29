using EcoTag.Core.DTOs.Simulador;

namespace EcoTag.Core.Interfaces
{
    public interface ISimuladorService
    {
        Task<SimuladorResponseDTO> SimularAsync(int userId, SimuladorRequestDTO request);
    }
}
