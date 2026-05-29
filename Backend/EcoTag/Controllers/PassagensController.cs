using System.Security.Claims;
using EcoTag.Core.DTOs.Passagens;
using EcoTag.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoTag.Controllers
{
    /// <summary>
    /// Registro de passagens de tag e consulta do historico do usuario.
    /// </summary>
    [ApiController]
    [Authorize]
    [Route("api/passagens")]
    public class PassagensController : ControllerBase
    {
        private readonly IPassagemService _passagemService;

        public PassagensController(IPassagemService passagemService)
        {
            _passagemService = passagemService;
        }

        /// <summary>
        /// Lista as passagens do usuario autenticado.
        /// </summary>
        /// <response code="200">Retorna historico de passagens com CO2e evitado.</response>
        /// <response code="401">Token JWT ausente ou invalido.</response>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var passagens = await _passagemService.GetByUserAsync(GetUserId());
            return Ok(passagens);
        }

        /// <summary>
        /// Registra uma passagem e calcula o CO2e evitado automaticamente.
        /// </summary>
        /// <remarks>
        /// O calculo usa o combustivel do veiculo, o tipo do local e as premissas ambientais cadastradas.
        /// </remarks>
        /// <response code="201">Passagem criada com CO2e calculado.</response>
        /// <response code="400">Premissas ambientais ausentes ou invalidas.</response>
        /// <response code="401">Token JWT ausente ou invalido.</response>
        /// <response code="404">Veiculo do usuario ou local de uso nao encontrado.</response>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePassagemTagRequestDTO request)
        {
            try
            {
                var passagem = await _passagemService.CreateAsync(GetUserId(), request);
                return Created($"/api/passagens/{passagem.Id}", passagem);
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
