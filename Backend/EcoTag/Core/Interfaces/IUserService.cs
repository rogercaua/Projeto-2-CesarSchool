using EcoTag.Core.DTOs.Users;

namespace EcoTag.Core.Interfaces
{
    public interface IUserService
    {
        Task<UserResponseDTO?> GetMeAsync(int userId);

        Task<UserResponseDTO?> UpdateMeAsync(int userId, UpdateUserRequestDTO request);
    }
}
