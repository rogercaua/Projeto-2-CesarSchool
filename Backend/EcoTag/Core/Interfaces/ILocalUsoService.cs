using EcoTag.Core.DTOs.Admin;

namespace EcoTag.Core.Interfaces
{
    public interface ILocalUsoService
    {
        Task<List<LocalUsoResponseDTO>> GetAllAsync();

        Task<LocalUsoResponseDTO?> GetByIdAsync(int id);

        Task<LocalUsoResponseDTO> CreateAsync(LocalUsoRequestDTO request);

        Task<LocalUsoResponseDTO?> UpdateAsync(int id, LocalUsoRequestDTO request);

        Task<bool> DeleteAsync(int id);
    }
}
