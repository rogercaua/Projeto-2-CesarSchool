using EcoTag.Core.DTOs.Users;

namespace EcoTag.Core.Interfaces
{
    public interface IUserService
    {
        Task<List<UserResponseDTO>> GetAllAsync();

        Task<UserResponseDTO?> GetMeAsync(int userId);

        Task<UserResponseDTO?> UpdateMeAsync(int userId, UpdateUserRequestDTO request);

        Task<UserResponseDTO?> UpdateByAdminAsync(int currentUserId, int userId, UpdateUserRequestDTO request);

        Task<bool> DeleteAsync(int currentUserId, int userId);
    }
}
