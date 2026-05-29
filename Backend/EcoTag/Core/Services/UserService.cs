using EcoTag.Core.DTOs.Users;
using EcoTag.Core.Interfaces;
using EcoTag.Core.Mappers;
using EcoTag.Data;
using Microsoft.EntityFrameworkCore;

namespace EcoTag.Core.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserResponseDTO?> GetMeAsync(int userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == userId);

            return user is null ? null : EcoTagMapper.ToResponse(user);
        }

        public async Task<UserResponseDTO?> UpdateMeAsync(int userId, UpdateUserRequestDTO request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(item => item.Id == userId);

            if (user is null)
            {
                return null;
            }

            var email = request.Email.Trim().ToLowerInvariant();
            var emailExists = await _context.Users
                .AnyAsync(item => item.Email == email && item.Id != userId);

            if (emailExists)
            {
                throw new ArgumentException("Email ja cadastrado por outro usuario.");
            }

            user.Nome = request.Nome.Trim();
            user.Email = email;

            await _context.SaveChangesAsync();

            return EcoTagMapper.ToResponse(user);
        }
    }
}
