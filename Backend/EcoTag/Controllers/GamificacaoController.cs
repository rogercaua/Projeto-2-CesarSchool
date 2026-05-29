using System.Security.Claims;
using EcoTag.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoTag.Controllers
{
    /// <summary>
    /// Pontos sustentaveis e selos do usuario.
    /// </summary>
    [ApiController]
    [Authorize]
    [Route("api/gamificacao")]
    public class GamificacaoController : ControllerBase
    {
        private readonly IGamificacaoService _gamificacaoService;

        public GamificacaoController(IGamificacaoService gamificacaoService)
        {
            _gamificacaoService = gamificacaoService;
        }

        /// <summary>
        /// Retorna pontos e selos desbloqueados pelo usuario autenticado.
        /// </summary>
        /// <response code="200">Resumo de gamificacao do usuario.</response>
        /// <response code="401">Token JWT ausente ou invalido.</response>
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var gamificacao = await _gamificacaoService.GetAsync(GetUserId());
            return Ok(gamificacao);
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }
    }
}
