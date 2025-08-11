using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace OnlyESBservice.Models
{
    public class AnalisisPedido
    {
        [Required(AllowEmptyStrings = true)]
        public string analisisId { get; set; } = string.Empty;
        public string nombre { get; set; } = null!;
        public decimal precio { get; set; }
        public string descripcion { get; set; } = string.Empty;
    }

    public class Anticipo
    {
        public decimal monto { get; set; }
    }

    public class Pedido
    {
        [Required(AllowEmptyStrings = true)]
        public bool status { get; set; } = true;
        public string usuarioId { get; set; } = string.Empty;
        public string estado { get; set; } = "pendiente"; // pendiente, pagado, cancelado
        public List<AnalisisPedido> analisis { get; set; } = new List<AnalisisPedido>();
        public decimal porcentajeDescuento { get; set; } = 0;
        public string notas { get; set; } = string.Empty;
        public Anticipo anticipo { get; set; } = new Anticipo();
    }
}