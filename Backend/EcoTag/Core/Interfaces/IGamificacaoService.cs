using EcoTag.Core.DTOs.Gamificacao;

namespace EcoTag.Core.Interfaces
{
    public interface IGamificacaoService
    {
        Task<GamificacaoResponseDTO> GetAsync(int userId);
    }
}
