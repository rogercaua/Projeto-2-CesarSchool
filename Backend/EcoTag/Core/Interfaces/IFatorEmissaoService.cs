using EcoTag.Core.DTOs.Admin;

namespace EcoTag.Core.Interfaces
{
    public interface IFatorEmissaoService
    {
        Task<List<FatorEmissaoResponseDTO>> GetAllAsync();

        Task<FatorEmissaoResponseDTO?> GetByTipoAsync(string tipoCombustivel);

        Task<FatorEmissaoResponseDTO> CreateAsync(FatorEmissaoRequestDTO request);

        Task<FatorEmissaoResponseDTO?> UpdateAsync(string tipoCombustivel, FatorEmissaoRequestDTO request);

        Task<bool> DeleteAsync(string tipoCombustivel);
    }
}
