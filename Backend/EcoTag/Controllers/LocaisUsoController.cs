using EcoTag.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoTag.Controllers
{
    /// <summary>
    /// Consulta dos locais disponiveis para passagens e simulacoes.
    /// </summary>
    [ApiController]
    [Authorize]
    [Route("api/locais-uso")]
    public class LocaisUsoController : ControllerBase
    {
        private readonly ILocalUsoService _localUsoService;

        public LocaisUsoController(ILocalUsoService localUsoService)
        {
            _localUsoService = localUsoService;
        }

        /// <summary>
        /// Lista locais de uso disponiveis para o usuario autenticado.
        /// </summary>
        /// <response code="200">Retorna locais cadastrados.</response>
        /// <response code="401">Token JWT ausente ou invalido.</response>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var locais = await _localUsoService.GetAllAsync();
            return Ok(locais);
        }

        /// <summary>
        /// Busca um local de uso por id.
        /// </summary>
        /// <param name="id">Identificador do local.</param>
        /// <response code="200">Retorna o local encontrado.</response>
        /// <response code="404">Local nao encontrado.</response>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var local = await _localUsoService.GetByIdAsync(id);
            return local is null ? NotFound(new { message = "Local de uso nao encontrado." }) : Ok(local);
        }
    }
}
