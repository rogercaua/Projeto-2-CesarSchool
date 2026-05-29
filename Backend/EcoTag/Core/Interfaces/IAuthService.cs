using EcoTag.Core.DTOs.Auth;
using EcoTag.Core.DTOs.Users;

namespace EcoTag.Core.Interfaces
{
    public interface IAuthService
    {
        Task<UserResponseDTO> RegisterAsync(RegisterRequestDTO request);

        Task<LoginResponseDTO?> LoginAsync(LoginRequestDTO request);
    }
}
