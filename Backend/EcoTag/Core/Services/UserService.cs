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

        public async Task<List<UserResponseDTO>> GetAllAsync()
        {
            var users = await _context.Users
                .AsNoTracking()
                .OrderBy(user => user.Role)
                .ThenBy(user => user.Nome)
                .ToListAsync();

            return users.Select(EcoTagMapper.ToResponse).ToList();
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

        public async Task<UserResponseDTO?> UpdateByAdminAsync(int currentUserId, int userId, UpdateUserRequestDTO request)
        {
            if (currentUserId == userId)
            {
                throw new InvalidOperationException("Use a tela de perfil para editar o proprio usuario logado.");
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(item => item.Id == userId);

            if (user is null)
            {
                return null;
            }

            if (!string.Equals(user.Role, "user", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Apenas usuarios comuns podem ser editados pelo admin.");
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

        public async Task<bool> DeleteAsync(int currentUserId, int userId)
        {
            if (currentUserId == userId)
            {
                throw new InvalidOperationException("Nao e possivel excluir o proprio usuario logado.");
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(item => item.Id == userId);

            if (user is null)
            {
                return false;
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
