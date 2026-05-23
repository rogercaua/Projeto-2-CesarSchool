using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization; 

namespace EcoTag.Models
{
    public class UserModel
    {
        [JsonIgnore] 
        public int Id { get; set; }

        [Required(ErrorMessage = "Nome é obrigatório.")]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email é obrigatório.")]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Senha é obrigatória.")]
        [JsonPropertyName("password")] 
        public string PasswordHash { get; set; } = string.Empty;

        [JsonIgnore] 
        public string Role { get; set; } = "user";

        [JsonIgnore] 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
