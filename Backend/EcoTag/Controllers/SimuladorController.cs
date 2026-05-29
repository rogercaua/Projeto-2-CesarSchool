using System.Security.Claims;
using EcoTag.Core.DTOs.Simulador;
using EcoTag.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoTag.Controllers
{
    /// <summary>
    /// Simulador de cenarios sustentaveis.
    /// </summary>
    [ApiController]
    [Authorize]
    [Route("api/simulador")]
    public class SimuladorController : ControllerBase
    {
        private readonly ISimuladorService _simuladorService;

        public SimuladorController(ISimuladorService simuladorService)
        {
            _simuladorService = simuladorService;
        }

        /// <summary>
        /// Simula CO2e evitado sem salvar passagem no historico.
        /// </summary>
        /// <remarks>
        /// Multiplica o resultado por passagem por dias vezes passagens por dia.
        /// </remarks>
        /// <response code="200">Resultado estimado da simulacao.</response>
        /// <response code="400">Premissas ambientais ausentes ou invalidas.</response>
        /// <response code="401">Token JWT ausente ou invalido.</response>
        /// <response code="404">Veiculo do usuario ou local de uso nao encontrado.</response>
        [HttpPost]
        public async Task<IActionResult> Simular([FromBody] SimuladorRequestDTO request)
        {
            try
            {
                var resultado = await _simuladorService.SimularAsync(GetUserId(), request);
                return Ok(resultado);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
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
