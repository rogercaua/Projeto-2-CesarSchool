using EcoTag.Core.DTOs.Admin;
using EcoTag.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoTag.Controllers
{
    /// <summary>
    /// Gerencia parametros do cenario sem tag por tipo de local.
    /// </summary>
    /// <remarks>
    /// #rota de admin: esses parametros definem fila, espera e ticket usados no calculo de CO2e evitado.
    /// </remarks>
    [ApiController]
    // #rota de admin: parametros ambientais sao regras globais do comparativo sem tag.
    [Authorize(Roles = "admin")]
    [Route("api/admin/parametros-cenario")]
    public class AdminParametrosCenarioController : ControllerBase
    {
        private readonly IParametrosCenarioSemTagService _parametrosService;

        public AdminParametrosCenarioController(IParametrosCenarioSemTagService parametrosService)
        {
            _parametrosService = parametrosService;
        }

        /// <summary>
        /// Lista todos os parametros ambientais cadastrados.
        /// </summary>
        /// <response code="200">Retorna os parametros por tipo de local.</response>
        /// <response code="401">Token JWT ausente ou invalido.</response>
        /// <response code="403">Usuario autenticado sem perfil admin.</response>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var parametros = await _parametrosService.GetAllAsync();
            return Ok(parametros);
        }

        /// <summary>
        /// Busca parametros pelo tipo de local.
        /// </summary>
        /// <param name="tipoLocal">Tipo normalizado: pedagio ou estacionamento.</param>
        /// <response code="200">Retorna os parametros encontrados.</response>
        /// <response code="400">Tipo de local invalido.</response>
        /// <response code="404">Parametros nao encontrados.</response>
        [HttpGet("{tipoLocal}")]
        public async Task<IActionResult> GetByTipo(string tipoLocal)
        {
            try
            {
                var parametros = await _parametrosService.GetByTipoAsync(tipoLocal);
                return parametros is null ? NotFound(new { message = "Parametros nao encontrados." }) : Ok(parametros);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Cria parametros para um tipo de local.
        /// </summary>
        /// <remarks>
        /// #rota de admin: permite configurar novas premissas ambientais sem alterar o codigo-fonte.
        /// </remarks>
        /// <response code="201">Parametros criados.</response>
        /// <response code="400">Payload invalido ou tipo ja cadastrado.</response>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ParametrosCenarioSemTagRequestDTO request)
        {
            try
            {
                var parametros = await _parametrosService.CreateAsync(request);
                return Created($"/api/admin/parametros-cenario/{parametros.TipoLocal}", parametros);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Atualiza parametros de um tipo de local.
        /// </summary>
        /// <remarks>
        /// #rota de admin: impacta os calculos futuros para pedagios ou estacionamentos.
        /// </remarks>
        /// <param name="tipoLocal">Tipo de local que sera atualizado.</param>
        /// <param name="request">Novos parametros ambientais do tipo de local.</param>
        /// <response code="200">Parametros atualizados.</response>
        /// <response code="400">Dados invalidos.</response>
        /// <response code="404">Parametros nao encontrados.</response>
        [HttpPut("{tipoLocal}")]
        public async Task<IActionResult> Update(string tipoLocal, [FromBody] ParametrosCenarioSemTagRequestDTO request)
        {
            try
            {
                var parametros = await _parametrosService.UpdateAsync(tipoLocal, request);
                return parametros is null ? NotFound(new { message = "Parametros nao encontrados." }) : Ok(parametros);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Remove parametros nao utilizados por locais de uso.
        /// </summary>
        /// <remarks>
        /// #rota de admin: a exclusao e bloqueada quando existem locais vinculados ao tipo.
        /// </remarks>
        /// <param name="tipoLocal">Tipo de local que sera removido.</param>
        /// <response code="204">Parametros removidos.</response>
        /// <response code="400">Parametros em uso ou tipo invalido.</response>
        /// <response code="404">Parametros nao encontrados.</response>
        [HttpDelete("{tipoLocal}")]
        public async Task<IActionResult> Delete(string tipoLocal)
        {
            try
            {
                var deleted = await _parametrosService.DeleteAsync(tipoLocal);
                return deleted ? NoContent() : NotFound(new { message = "Parametros nao encontrados." });
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
