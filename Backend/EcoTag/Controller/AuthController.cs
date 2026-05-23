using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using static BCrypt.Net.BCrypt;
using EcoTag.Data;
using EcoTag.Models;
using Microsoft.AspNetCore.Authorization; 
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace EcoTag.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(
            AppDbContext context,
            IConfiguration configuration
        )
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(
            [FromBody] UserModel request
        )
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (string.IsNullOrWhiteSpace(request.Nome))
            {
                return BadRequest(new { message = "Nome inválido." });
            }

            var emailExists = await _context.Users
                .AnyAsync(x => x.Email == request.Email);

            if (emailExists)
            {
                return BadRequest(new { message = "Email já cadastrado." });
            }


            var user = new UserModel
            {
                Nome = request.Nome.Trim(),
                Email = request.Email.Trim(),
                PasswordHash = HashPassword(request.PasswordHash),
                
                Role = "user", 
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Usuário criado com sucesso." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] UserModel request
        )
        {
 
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Email == request.Email);

            if (user == null)
            {
                return Unauthorized(new { message = "Email ou senha inválidos." });
            }

            var validPassword = Verify(
                request.PasswordHash,
                user.PasswordHash
            );

            if (!validPassword)
            {
                return Unauthorized(new { message = "Email ou senha inválidos." });
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Nome),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new { token = tokenString });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(user => new
                {
                    user.Id,
                    user.Nome,
                    user.Email,
                    user.Role,
                    user.CreatedAt
                })
                .ToListAsync();
            
            return Ok(users);
        }
    }
}
