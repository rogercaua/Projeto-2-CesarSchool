using EcoTag.Core.DTOs.Admin;
using EcoTag.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoTag.Controllers
{
    /// <summary>
    /// Gerencia os fatores de emissao por combustivel usados no calculo de CO2e.
    /// </summary>
    /// <remarks>
    /// #rota de admin: alterar esses valores muda o resultado ambiental calculado para todos os usuarios.
    /// </remarks>
    [ApiController]
    // #rota de admin: fatores de emissao sao premissas globais do motor de calculo.
    [Authorize(Roles = "admin")]
    [Route("api/admin/fatores-emissao")]
    public class AdminFatoresEmissaoController : ControllerBase
    {
        private readonly IFatorEmissaoService _fatorEmissaoService;

        public AdminFatoresEmissaoController(IFatorEmissaoService fatorEmissaoService)
        {
            _fatorEmissaoService = fatorEmissaoService;
        }

        /// <summary>
        /// Lista todos os fatores de emissao cadastrados.
        /// </summary>
        /// <response code="200">Retorna os fatores por tipo de combustivel.</response>
        /// <response code="401">Token JWT ausente ou invalido.</response>
        /// <response code="403">Usuario autenticado sem perfil admin.</response>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var fatores = await _fatorEmissaoService.GetAllAsync();
            return Ok(fatores);
        }

        /// <summary>
        /// Busca um fator de emissao pelo tipo de combustivel.
        /// </summary>
        /// <param name="tipoCombustivel">Combustivel normalizado: gasolina, etanol ou diesel.</param>
        /// <response code="200">Retorna o fator encontrado.</response>
        /// <response code="400">Tipo de combustivel invalido.</response>
        /// <response code="404">Fator nao encontrado.</response>
        [HttpGet("{tipoCombustivel}")]
        public async Task<IActionResult> GetByTipo(string tipoCombustivel)
        {
            try
            {
                var fator = await _fatorEmissaoService.GetByTipoAsync(tipoCombustivel);
                return fator is null ? NotFound(new { message = "Fator de emissao nao encontrado." }) : Ok(fator);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Cria um novo fator de emissao.
        /// </summary>
        /// <remarks>
        /// #rota de admin: usada quando uma premissa ambiental precisa entrar no sistema sem alterar codigo.
        /// </remarks>
        /// <response code="201">Fator criado.</response>
        /// <response code="400">Payload invalido ou fator ja existente.</response>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FatorEmissaoRequestDTO request)
        {
            try
            {
                var fator = await _fatorEmissaoService.CreateAsync(request);
                return Created($"/api/admin/fatores-emissao/{fator.TipoCombustivel}", fator);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Atualiza um fator de emissao existente.
        /// </summary>
        /// <remarks>
        /// #rota de admin: permite ajustar consumo e multiplicador ambiental usados nas passagens futuras.
        /// </remarks>
        /// <param name="tipoCombustivel">Combustivel que sera atualizado.</param>
        /// <param name="request">Novos valores do fator de emissao.</param>
        /// <response code="200">Fator atualizado.</response>
        /// <response code="400">Dados invalidos.</response>
        /// <response code="404">Fator nao encontrado.</response>
        [HttpPut("{tipoCombustivel}")]
        public async Task<IActionResult> Update(string tipoCombustivel, [FromBody] FatorEmissaoRequestDTO request)
        {
            try
            {
                var fator = await _fatorEmissaoService.UpdateAsync(tipoCombustivel, request);
                return fator is null ? NotFound(new { message = "Fator de emissao nao encontrado." }) : Ok(fator);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Remove um fator de emissao nao obrigatorio e nao utilizado.
        /// </summary>
        /// <remarks>
        /// #rota de admin: os fatores padrao do motor de calculo devem ser editados, nao removidos.
        /// </remarks>
        /// <param name="tipoCombustivel">Combustivel que sera removido.</param>
        /// <response code="204">Fator removido.</response>
        /// <response code="400">Fator obrigatorio, fator em uso ou tipo invalido.</response>
        /// <response code="404">Fator nao encontrado.</response>
        [HttpDelete("{tipoCombustivel}")]
        public async Task<IActionResult> Delete(string tipoCombustivel)
        {
            try
            {
                var deleted = await _fatorEmissaoService.DeleteAsync(tipoCombustivel);
                return deleted ? NoContent() : NotFound(new { message = "Fator de emissao nao encontrado." });
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
    }
}
