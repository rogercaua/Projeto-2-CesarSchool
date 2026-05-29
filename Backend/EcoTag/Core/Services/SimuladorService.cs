using EcoTag.Core.DTOs.Simulador;
using EcoTag.Core.Interfaces;
using EcoTag.Data;
using Microsoft.EntityFrameworkCore;

namespace EcoTag.Core.Services
{
    public class SimuladorService : ISimuladorService
    {
        private readonly AppDbContext _context;
        private readonly ICalculoEmissaoService _calculoEmissaoService;

        public SimuladorService(
            AppDbContext context,
            ICalculoEmissaoService calculoEmissaoService
        )
        {
            _context = context;
            _calculoEmissaoService = calculoEmissaoService;
        }

        public async Task<SimuladorResponseDTO> SimularAsync(int userId, SimuladorRequestDTO request)
        {
            var veiculo = await _context.Veiculos
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == request.VeiculoId && item.UsuarioId == userId);

            if (veiculo is null)
            {
                throw new KeyNotFoundException("Veiculo nao encontrado para este usuario.");
            }

            var localUso = await _context.LocaisUso
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == request.LocalUsoId);

            if (localUso is null)
            {
                throw new KeyNotFoundException("Local de uso nao encontrado.");
            }

            var co2PorPassagem = await _calculoEmissaoService
                .CalcularCo2EvitadoAsync(veiculo.TipoCombustivel, localUso.TipoLocal);

            var totalPassagens = request.Dias * request.PassagensPorDia;
            var totalCo2 = Math.Round(co2PorPassagem * totalPassagens, 6, MidpointRounding.AwayFromZero);

            return new SimuladorResponseDTO
            {
                Dias = request.Dias,
                PassagensPorDia = request.PassagensPorDia,
                TotalPassagens = totalPassagens,
                Co2EvitadoPorPassagemKg = co2PorPassagem,
                Co2EvitadoTotalKg = totalCo2,
                Co2EmitidoAMaisSemTagKg = totalCo2
            };
        }
    }
}
