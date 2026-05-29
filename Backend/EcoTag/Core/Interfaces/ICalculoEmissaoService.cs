namespace EcoTag.Core.Interfaces
{
    public interface ICalculoEmissaoService
    {
        Task<double> CalcularCo2EvitadoAsync(string tipoCombustivel, string tipoLocal);
    }
}
