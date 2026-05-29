using EcoTag.Core.DTOs.Passagens;

namespace EcoTag.Core.Interfaces
{
    public interface IPassagemService
    {
        Task<List<PassagemTagResponseDTO>> GetByUserAsync(int userId);

        Task<PassagemTagResponseDTO> CreateAsync(int userId, CreatePassagemTagRequestDTO request);
    }
}
