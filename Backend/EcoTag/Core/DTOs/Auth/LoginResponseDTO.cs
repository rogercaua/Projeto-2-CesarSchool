using EcoTag.Core.DTOs.Users;

namespace EcoTag.Core.DTOs.Auth
{
    public class LoginResponseDTO
    {
        public string Token { get; set; } = string.Empty;

        public UserResponseDTO User { get; set; } = new();
    }
}
