using System.ComponentModel.DataAnnotations;

namespace EcoTag.Models
{
    public class UserModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Nome é obrigatório.")]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email é obrigatório.")]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Senha é obrigatória.")]
        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = "user";

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;
    }
}