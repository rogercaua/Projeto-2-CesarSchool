using EcoTag.Core.DTOs.Admin;

namespace EcoTag.Core.Interfaces
{
    public interface IParametrosCenarioSemTagService
    {
        Task<List<ParametrosCenarioSemTagResponseDTO>> GetAllAsync();

        Task<ParametrosCenarioSemTagResponseDTO?> GetByTipoAsync(string tipoLocal);

        Task<ParametrosCenarioSemTagResponseDTO> CreateAsync(ParametrosCenarioSemTagRequestDTO request);

        Task<ParametrosCenarioSemTagResponseDTO?> UpdateAsync(string tipoLocal, ParametrosCenarioSemTagRequestDTO request);

        Task<bool> DeleteAsync(string tipoLocal);
    }
}
