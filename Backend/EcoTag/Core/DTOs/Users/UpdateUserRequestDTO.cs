using System.ComponentModel.DataAnnotations;

namespace EcoTag.Core.DTOs.Users
{
    public class UpdateUserRequestDTO
    {
        [Required]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;
    }
}
