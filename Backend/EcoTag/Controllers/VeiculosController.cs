using System.Security.Claims;
using EcoTag.Core.DTOs.Veiculos;
using EcoTag.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoTag.Controllers
{
    /// <summary>
    /// CRUD dos veiculos do usuario autenticado.
    /// </summary>
    [ApiController]
    [Authorize]
    [Route("api/veiculos")]
    public class VeiculosController : ControllerBase
    {
        private readonly IVeiculoService _veiculoService;

        public VeiculosController(IVeiculoService veiculoService)
        {
            _veiculoService = veiculoService;
        }

        /// <summary>
        /// Lista os veiculos cadastrados pelo usuario autenticado.
        /// </summary>
        /// <response code="200">Retorna os veiculos do usuario.</response>
        /// <response code="401">Token JWT ausente ou invalido.</response>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var veiculos = await _veiculoService.GetByUserAsync(GetUserId());
            return Ok(veiculos);
        }

        /// <summary>
        /// Cadastra um veiculo para o usuario autenticado.
        /// </summary>
        /// <remarks>
        /// O tipo de combustivel define qual fator de emissao sera usado nas passagens.
        /// </remarks>
        /// <response code="201">Veiculo criado.</response>
        /// <response code="400">Tipo de veiculo ou combustivel invalido.</response>
        /// <response code="401">Token JWT ausente ou invalido.</response>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateVeiculoRequestDTO request)
        {
            try
            {
                var veiculo = await _veiculoService.CreateAsync(GetUserId(), request);
                return Created($"/api/veiculos/{veiculo.Id}", veiculo);
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
        /// Atualiza um veiculo do proprio usuario.
        /// </summary>
        /// <param name="id">Identificador do veiculo.</param>
        /// <param name="request">Novos dados do veiculo.</param>
        /// <response code="200">Veiculo atualizado.</response>
        /// <response code="400">Dados invalidos.</response>
        /// <response code="401">Token JWT ausente ou invalido.</response>
        /// <response code="404">Veiculo nao encontrado para este usuario.</response>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateVeiculoRequestDTO request)
        {
            try
            {
                var veiculo = await _veiculoService.UpdateAsync(GetUserId(), id, request);
                return veiculo is null ? NotFound(new { message = "Veiculo nao encontrado." }) : Ok(veiculo);
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
        /// Exclui um veiculo do proprio usuario.
        /// </summary>
        /// <param name="id">Identificador do veiculo.</param>
        /// <response code="204">Veiculo excluido.</response>
        /// <response code="401">Token JWT ausente ou invalido.</response>
        /// <response code="404">Veiculo nao encontrado para este usuario.</response>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _veiculoService.DeleteAsync(GetUserId(), id);
            return deleted ? NoContent() : NotFound(new { message = "Veiculo nao encontrado." });
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }
    }
}
