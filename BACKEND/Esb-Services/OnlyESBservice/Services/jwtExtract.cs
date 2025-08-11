using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace OnlyESBservice.Services
{
    public static class JwtHelper
    {

        private static readonly string secretKey = "asdfghjkl";

        public static string GetUserIdFromToken(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "id");
            return userIdClaim?.Value;
        }
        public static string GetUserRolFromToken(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            var userRolClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "rol");
            return userRolClaim?.Value;
        }
        public static bool IsValidToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(secretKey);

            try
            {
                // Valida firma, expiración, etc.
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero // Sin tolerancia en expiración
                }, out SecurityToken validatedToken);

                // Si no lanza excepción, el token es válido
                return true;
            }
            catch
            {
                return false; // Token inválido o expirado
            }
        }
    }
}
