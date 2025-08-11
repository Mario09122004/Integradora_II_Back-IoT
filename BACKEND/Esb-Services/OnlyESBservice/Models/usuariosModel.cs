using System;

namespace OnlyESBservice.Models
{
    public class Usuario
    {
        public string correo { get; set; } = null!;
        public string? contraseña { get; set; } 
        public string rol { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string apellidoPaterno { get; set; } = null!;
        public string apellidoMaterno { get; set; } = null!;
        public DateTime fechaNacimiento { get; set; }
    }
}
