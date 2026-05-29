using System.Text.Json.Serialization;

namespace EcoTag.Models
{
    public class PassagemTagModel
    {
        public int Id { get; set; }

        public int VeiculoId { get; set; }

        public int LocalUsoId { get; set; }

        public DateTime DataHora { get; set; } = DateTime.UtcNow;

        public double Co2EvitadoKg { get; set; }

        [JsonIgnore]
        public VeiculoModel? Veiculo { get; set; }

        [JsonIgnore]
        public LocalUsoModel? LocalUso { get; set; }
    }
}
