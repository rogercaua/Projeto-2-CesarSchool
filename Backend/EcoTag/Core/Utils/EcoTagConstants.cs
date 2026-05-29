namespace EcoTag.Core.Utils
{
    public static class EcoTagConstants
    {
        public static readonly string[] TiposVeiculo =
        {
            "carro",
            "moto",
            "caminhao"
        };

        public static readonly string[] TiposCombustivel =
        {
            "gasolina",
            "etanol",
            "diesel"
        };

        public static readonly string[] TiposLocal =
        {
            "pedagio",
            "estacionamento"
        };

        public static readonly IReadOnlyList<(string Nome, double MarcoKg)> Selos =
        [
            ("Iniciante Verde", 1),
            ("Motorista Consciente", 5),
            ("Guardiao do Ar", 10),
            ("Referencia Sustentavel", 25)
        ];
    }
}
