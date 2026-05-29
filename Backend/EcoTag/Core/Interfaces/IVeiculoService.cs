using EcoTag.Core.DTOs.Veiculos;

namespace EcoTag.Core.Interfaces
{
    public interface IVeiculoService
    {
        Task<List<VeiculoResponseDTO>> GetByUserAsync(int userId);

        Task<VeiculoResponseDTO> CreateAsync(int userId, CreateVeiculoRequestDTO request);

        Task<VeiculoResponseDTO?> UpdateAsync(int userId, int id, UpdateVeiculoRequestDTO request);

        Task<bool> DeleteAsync(int userId, int id);
    }
}
