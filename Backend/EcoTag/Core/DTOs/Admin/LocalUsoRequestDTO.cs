using System.ComponentModel.DataAnnotations;

namespace EcoTag.Core.DTOs.Admin
{
    public class LocalUsoRequestDTO
    {
        [Required]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public string TipoLocal { get; set; } = string.Empty;
    }
}
