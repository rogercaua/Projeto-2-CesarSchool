using System.Security.Claims;
using EcoTag.Core.DTOs.Users;
using EcoTag.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoTag.Controllers
{
    /// <summary>
    /// Perfil do usuario autenticado.
    /// </summary>
    [ApiController]
    [Authorize]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Retorna o perfil do usuario autenticado.
        /// </summary>
        /// <response code="200">Perfil encontrado.</response>
        /// <response code="401">Token JWT ausente ou invalido.</response>
        /// <response code="404">Usuario nao encontrado.</response>
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var user = await _userService.GetMeAsync(GetUserId());
            return user is null ? NotFound(new { message = "Usuario nao encontrado." }) : Ok(user);
        }

        /// <summary>
        /// Atualiza nome e email do usuario autenticado.
        /// </summary>
        /// <response code="200">Perfil atualizado.</response>
        /// <response code="400">Dados invalidos ou email ja usado por outro usuario.</response>
        /// <response code="401">Token JWT ausente ou invalido.</response>
        /// <response code="404">Usuario nao encontrado.</response>
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMe([FromBody] UpdateUserRequestDTO request)
        {
            try
            {
                var user = await _userService.UpdateMeAsync(GetUserId(), request);
                return user is null ? NotFound(new { message = "Usuario nao encontrado." }) : Ok(user);
            }
            catch (ArgumentException ex)
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
