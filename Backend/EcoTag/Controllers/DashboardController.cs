using System.Security.Claims;
using EcoTag.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoTag.Controllers
{
    /// <summary>
    /// Indicadores de impacto ambiental do usuario.
    /// </summary>
    [ApiController]
    [Authorize]
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// Retorna totais de CO2e evitado no mes, no ano e no historico.
        /// </summary>
        /// <response code="200">Indicadores calculados para o usuario autenticado.</response>
        /// <response code="401">Token JWT ausente ou invalido.</response>
        [HttpGet("impacto")]
        public async Task<IActionResult> GetImpacto()
        {
            var impacto = await _dashboardService.GetImpactoAsync(GetUserId());
            return Ok(impacto);
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }
    }
}
