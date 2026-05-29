using EcoTag.Core.DTOs.Auth;
using EcoTag.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EcoTag.Controllers
{
    /// <summary>
    /// Cadastro e autenticacao de usuarios.
    /// </summary>
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Cadastra um usuario comum.
        /// </summary>
        /// <remarks>
        /// Retorna os dados publicos do usuario. A senha e armazenada como hash.
        /// </remarks>
        /// <response code="201">Usuario criado.</response>
        /// <response code="400">Dados invalidos ou email ja cadastrado.</response>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDTO request)
        {
            try
            {
                var user = await _authService.RegisterAsync(request);
                return StatusCode(StatusCodes.Status201Created, user);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Autentica o usuario e emite um token JWT.
        /// </summary>
        /// <remarks>
        /// Use o token retornado no botao Authorize do Swagger para acessar rotas protegidas.
        /// </remarks>
        /// <response code="200">Login realizado com token JWT.</response>
        /// <response code="401">Email ou senha invalidos.</response>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO request)
        {
            var response = await _authService.LoginAsync(request);

            if (response is null)
            {
                return Unauthorized(new { message = "Email ou senha invalidos." });
            }

            return Ok(response);
        }
    }
}
