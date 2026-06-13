using System.Security.Claims;
using EcoTag.Core.DTOs.Users;
using EcoTag.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoTag.Controllers
{
    /// <summary>
    /// Gerencia usuarios pelo painel administrativo.
    /// </summary>
    [ApiController]
    [Authorize(Roles = "admin")]
    [Route("api/admin/users")]
    public class AdminUsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public AdminUsersController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Lista todos os usuarios cadastrados.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAllAsync();
            return Ok(users);
        }

        /// <summary>
        /// Atualiza nome e email de um usuario comum.
        /// </summary>
        /// <param name="id">Identificador do usuario comum.</param>
        /// <param name="request">Novos dados do usuario.</param>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequestDTO request)
        {
            try
            {
                var user = await _userService.UpdateByAdminAsync(GetUserId(), id, request);
                return user is null ? NotFound(new { message = "Usuario nao encontrado." }) : Ok(user);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Remove um usuario e todos os dados relacionados a ele.
        /// </summary>
        /// <param name="id">Identificador do usuario.</param>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _userService.DeleteAsync(GetUserId(), id);
                return deleted ? NoContent() : NotFound(new { message = "Usuario nao encontrado." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }
    }
}
