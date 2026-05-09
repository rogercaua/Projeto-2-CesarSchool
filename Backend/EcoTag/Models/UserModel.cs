using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace EcoTag.Models
{
    public class UserModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Nome é obrigatorio.")]
        public string Nome { get; set; }
        
        [EmailAddress]
        [Required(ErrorMessage = "Email é Obrigatorio")]
        public string Email { get; set; }

    }
}