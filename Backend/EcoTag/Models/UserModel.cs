using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace EcoTag.Models
{
    public class UserModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Nome e obrigatorio.")]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email e obrigatorio.")]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = "user";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public ICollection<VeiculoModel> Veiculos { get; set; } = new List<VeiculoModel>();
    }
}
