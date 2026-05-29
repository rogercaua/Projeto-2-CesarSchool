using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace EcoTag.Models
{
    public class VeiculoModel
    {
        public int Id { get; set; }

        public int UsuarioId { get; set; }

        [Required]
        [MaxLength(30)]
        public string TipoVeiculo { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public string TipoCombustivel { get; set; } = string.Empty;

        [JsonIgnore]
        public UserModel? Usuario { get; set; }

        [JsonIgnore]
        public FatorEmissaoModel? FatorEmissao { get; set; }

        [JsonIgnore]
        public ICollection<PassagemTagModel> Passagens { get; set; } = new List<PassagemTagModel>();
    }
}
