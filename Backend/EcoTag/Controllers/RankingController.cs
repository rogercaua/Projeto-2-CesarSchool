using EcoTag.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoTag.Controllers
{
    /// <summary>
    /// Ranking de sustentabilidade por pontos mensais.
    /// </summary>
    [ApiController]
    [Authorize]
    [Route("api/ranking")]
    public class RankingController : ControllerBase
    {
        private readonly IRankingService _rankingService;

        public RankingController(IRankingService rankingService)
        {
            _rankingService = rankingService;
        }

        /// <summary>
        /// Lista o ranking mensal de usuarios por CO2e evitado.
        /// </summary>
        /// <param name="periodo">Periodo do ranking. Use mensal.</param>
        /// <param name="limit">Quantidade maxima de itens, entre 1 e 100.</param>
        /// <response code="200">Ranking calculado.</response>
        /// <response code="400">Periodo invalido.</response>
        /// <response code="401">Token JWT ausente ou invalido.</response>
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string periodo = "mensal", [FromQuery] int limit = 10)
        {
            try
            {
                var ranking = await _rankingService.GetAsync(periodo, limit);
                return Ok(ranking);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
