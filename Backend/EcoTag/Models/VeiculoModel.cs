using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace EcoTag.Models
{
    public class VeiculoModel
    {
        public int Id { get; set; }

        public string ModeloVeiculo {get; set;}

        [Required(ErrorMessage = "Tipo de Veiculo é obrigatorio")]
        public string TipoVeiculo { get; set; }

        [Required]
        public string TipoCombustivel { get; set; }


    }
}