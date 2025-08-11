using System;
using OnlyESBservice.Models.modelsMuestras;

namespace OnlyESBservice.Models
{
    public class Muestra
    {

        public string? observaciones { get; set; }

        public string nombrePaciente { get; set; } = null!;

        public string tipoMuestra { get; set; } = null!; // "quimicaSanguinea" o "biometriaHematica"

        public QuimicaSanguinea? quimicaSanguinea { get; set; }

        public BiometriaHematica? biometriaHematica { get; set; }

        public string idusuario { get; set; } = null!;

        public string? pedidoId { get; set; }

    }

    public class MuestraUpdate
    {
        public string? observaciones { get; set; }
        public string? nombrePaciente { get; set; }
        public string? idusuario { get; set; }
        public string? pedidoId { get; set; }
        public QuimicaSanguinea? quimicaSanguinea { get; set; }
        public BiometriaHematica? biometriaHematica { get; set; }
    }

}
