using EcoTag.Core.DTOs.Admin;
using EcoTag.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoTag.Controllers
{
    /// <summary>
    /// Gerencia os locais onde passagens e simulacoes podem ocorrer.
    /// </summary>
    /// <remarks>
    /// #rota de admin: locais disponiveis afetam quais pontos podem gerar calculo de impacto.
    /// </remarks>
    [ApiController]
    // #rota de admin: locais de uso sao dados operacionais compartilhados por toda a base.
    [Authorize(Roles = "admin")]
    [Route("api/admin/locais-uso")]
    public class AdminLocaisUsoController : ControllerBase
    {
        private readonly ILocalUsoService _localUsoService;

        public AdminLocaisUsoController(ILocalUsoService localUsoService)
        {
            _localUsoService = localUsoService;
        }

        /// <summary>
        /// Lista todos os locais de uso.
        /// </summary>
        /// <response code="200">Retorna locais cadastrados.</response>
        /// <response code="401">Token JWT ausente ou invalido.</response>
        /// <response code="403">Usuario autenticado sem perfil admin.</response>
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

        /// <summary>
        /// Cria um local de uso.
        /// </summary>
        /// <remarks>
        /// #rota de admin: cria pontos como pedagios e estacionamentos para uso nas passagens.
        /// </remarks>
        /// <response code="201">Local criado.</response>
        /// <response code="400">Payload invalido ou tipo de local sem parametros.</response>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] LocalUsoRequestDTO request)
        {
            try
            {
                var local = await _localUsoService.CreateAsync(request);
                return Created($"/api/admin/locais-uso/{local.Id}", local);
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
        /// Atualiza um local de uso.
        /// </summary>
        /// <remarks>
        /// #rota de admin: altera o nome ou o tipo de local usado em passagens futuras.
        /// </remarks>
        /// <param name="id">Identificador do local.</param>
        /// <param name="request">Novos dados do local de uso.</param>
        /// <response code="200">Local atualizado.</response>
        /// <response code="400">Dados invalidos.</response>
        /// <response code="404">Local nao encontrado.</response>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] LocalUsoRequestDTO request)
        {
            try
            {
                var local = await _localUsoService.UpdateAsync(id, request);
                return local is null ? NotFound(new { message = "Local de uso nao encontrado." }) : Ok(local);
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
        /// Remove um local sem passagens registradas.
        /// </summary>
        /// <remarks>
        /// #rota de admin: a exclusao e bloqueada quando o local ja possui historico de passagens.
        /// </remarks>
        /// <param name="id">Identificador do local.</param>
        /// <response code="204">Local removido.</response>
        /// <response code="400">Local possui passagens registradas.</response>
        /// <response code="404">Local nao encontrado.</response>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _localUsoService.DeleteAsync(id);
                return deleted ? NoContent() : NotFound(new { message = "Local de uso nao encontrado." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
