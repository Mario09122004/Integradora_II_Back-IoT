using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Text.Json;

using OnlyESBservice.Models;
using OnlyESBservice.Services;

namespace OnlyESBservice.Controllers
{
    [ApiController]
    [Route("usuarios")]
    public class UsuariosController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly RedisService _redisService;

        public UsuariosController(IHttpClientFactory httpClientFactory, RedisService redisService)
        {
            _httpClient = httpClientFactory.CreateClient();
            _redisService = redisService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            string token = Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token))
                return Unauthorized("Token no proporcionado.");

            string userId = JwtHelper.GetUserIdFromToken(token);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Token inválido (no contiene userId).");

            bool tokenIsValid = await _redisService.TokenExistsAsync(userId, token);
            if (!tokenIsValid)
                return Unauthorized("Token no válido o expirado.");

            // Refrescar token
            await _redisService.RefreshTokenTTLAsync(userId);

            //Validar rol
            string rolToken = JwtHelper.GetUserRolFromToken(token);
            if (rolToken!="admin" && rolToken!="laboratory" && rolToken!="accounting") {
                return Unauthorized("No autorizado");
            }

            var response = await _httpClient.GetAsync($"http://api_users:3001/v1/usuarios");
            var content = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, content);
            }

            using var jsonDoc = JsonDocument.Parse(content);
            var jsonElement = jsonDoc.RootElement.Clone();

            return new JsonResult(jsonElement);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Usuario data)
        {
            /*
            string token = Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            ////////////////

            if (string.IsNullOrEmpty(token))
                return Unauthorized("Token no proporcionado.");

            string userId = JwtHelper.GetUserIdFromToken(token);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Token inválido (no contiene userId).");

            bool tokenIsValid = await _redisService.TokenExistsAsync(userId, token);
            if (!tokenIsValid)
                return Unauthorized("Token no válido o expirado.");

            // Refrescar token
            await _redisService.RefreshTokenTTLAsync(userId);
            
            ////////////////////
            //Validar si el token es de un admin, para que ponga un rol que no sea el basico, en caso contrario solo podra poner rol de patient
            string rolUser = JwtHelper.GetUserRolFromToken(token);
            if (rolUser == "accounting" || rolUser == "laboratory" || rolUser == "patient") {
                if (rolUser != "admin") {
                    data.rol = "patient";
                }
            }
            
            //Validar rol
            string rolToken = JwtHelper.GetUserRolFromToken(token);
            if (rolToken!="admin" && rolToken!="laboratory" && rolToken!="accounting") {
                return Unauthorized("No autorizado");
            }
            */
            var json = JsonSerializer.Serialize(data);

            var content = new StringContent(json, Encoding.UTF8, "application/json");

            Console.WriteLine(json);
            var response = await _httpClient.PostAsync("http://api_users:3001/v1/usuarios/register", content);
            var result = await response.Content.ReadAsStringAsync();
            var contentType = response.Content.Headers.ContentType?.ToString() ?? "application/json";

            return new ContentResult
            {
                StatusCode = (int)response.StatusCode,
                Content = result,
                ContentType = contentType
            };
        }


        [HttpDelete("{userIdurl}")]
        public async Task<IActionResult> Delete(string userIdurl)
        {
            string token = Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token))
                return Unauthorized("Token no proporcionado.");

            string userId = JwtHelper.GetUserIdFromToken(token);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Token inválido (no contiene userId).");

            bool tokenIsValid = await _redisService.TokenExistsAsync(userId, token);
            if (!tokenIsValid)
                return Unauthorized("Token no válido o expirado.");

            // Refrescar token
            await _redisService.RefreshTokenTTLAsync(userId);

            //Validar rol
            string rolToken = JwtHelper.GetUserRolFromToken(token);
            if (rolToken!="admin" && rolToken!="laboratory" && rolToken!="accounting") {
                return Unauthorized("No autorizado");
            }

            var response = await _httpClient.DeleteAsync($"http://api_users:3001/v1/usuarios/{userIdurl}");
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }

        [HttpPut("{userIdurl}")]
        public async Task<IActionResult> Put([FromBody] JsonElement data, string userIdurl)
        {
            string token = Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token))
                return Unauthorized("Token no proporcionado.");

            string userId = JwtHelper.GetUserIdFromToken(token);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Token inválido (no contiene userId).");

            string rolToken = JwtHelper.GetUserRolFromToken(token);
            if (userId != userIdurl && rolToken != "admin")
            {
                return Unauthorized("No autorizado para modificar esta cuenta");
            }

            bool tokenIsValid = await _redisService.TokenExistsAsync(userId, token);
            if (!tokenIsValid)
                return Unauthorized("Token no válido o expirado.");

            // Refrescar token
            await _redisService.RefreshTokenTTLAsync(userId);

            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var json = JsonSerializer.Serialize(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PutAsync($"http://api_users:3001/v1/usuarios/{userIdurl}", content);

            var result = await response.Content.ReadAsStringAsync();
            return Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json");

        }

    }
    [ApiController]
    [Route("usuarios/login")]
    public class usuariosFucnionesController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly RedisService _redisService;

        public usuariosFucnionesController(IHttpClientFactory httpClientFactory, RedisService redisService)
        {
            _httpClient = httpClientFactory.CreateClient();
            _redisService = redisService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            string token = Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token))
                return Unauthorized("Token no proporcionado.");

            string userId = JwtHelper.GetUserIdFromToken(token);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Token inválido (no contiene userId).");

            bool tokenIsValid = await _redisService.TokenExistsAsync(userId, token);
            if (!tokenIsValid)
                return Unauthorized("Token no válido o expirado.");

            // Refrescar token
            await _redisService.RefreshTokenTTLAsync(userId);

            var requestMessage = new HttpRequestMessage(HttpMethod.Get, "http://api_users:3001/v1/usuarios/profile");

            if (!string.IsNullOrEmpty(token))
            {
                requestMessage.Headers.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            }

            var response = await _httpClient.SendAsync(requestMessage);
            var content = await response.Content.ReadAsStringAsync();

            return Content(content, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] JsonElement data)
        {
            var json = JsonSerializer.Serialize(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("http://api_users:3001/v1/usuarios/login", content);
            var result = await response.Content.ReadAsStringAsync();

            return Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }

        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();

            if (string.IsNullOrEmpty(authHeader))
            {
                return BadRequest(new { message = "No se recibió token en la petición" });
            }

            // Limpia el token, remueve el prefijo "Bearer "
            string token = authHeader.StartsWith("Bearer ") ? authHeader.Substring("Bearer ".Length) : authHeader;

            string extractedUserId;
            try
            {
                extractedUserId = JwtHelper.GetUserIdFromToken(token);
            }
            catch (Exception)
            {
                return BadRequest(new { message = "Token inválido o mal formado" });
            }

            if (string.IsNullOrEmpty(extractedUserId))
            {
                return BadRequest(new { message = "No se pudo extraer userId del token" });
            }

            bool eliminado = await _redisService.DeleteTokenAsync(extractedUserId);

            if (eliminado)
            {
                return Ok(new { message = "Logout exitoso" });
            }

            return NotFound(new { message = "Token no encontrado o ya eliminado" });

        }
    }
    [ApiController]
    [Route("usuarios/forget")]
    public class usuariosForgetController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public usuariosForgetController(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] JsonElement data)
        {
            var json = JsonSerializer.Serialize(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("http://api_users:3001/v1/usuarios/forgetPassword", content);
            var result = await response.Content.ReadAsStringAsync();

            return Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }
    }
}
