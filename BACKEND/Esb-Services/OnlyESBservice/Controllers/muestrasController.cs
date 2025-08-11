using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;

using OnlyESBservice.Models;
using OnlyESBservice.Services;
using OnlyESBservice.Helpers;

namespace OnlyESBservice.Controllers
{
    [ApiController]
    [Route("muestras")]
    public class MuestrasController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly RedisService _redisService;

        public MuestrasController(IHttpClientFactory httpClientFactory, RedisService redisService)
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

            var response = await _httpClient.GetAsync("http://api_muestras:3002/v1/muestras");
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Muestra data)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

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

            var json = JsonSerializer.Serialize(data);

            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("http://api_muestras:3002/v1/muestras", content);
            var result = await response.Content.ReadAsStringAsync();

            return Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(string id, [FromBody] MuestraUpdate data)
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

            var json = JsonSerializer.Serialize(data, JsonHelper.CamelCaseIgnoreNull);

            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PutAsync($"http://api_muestras:3002/v1/muestras/{id}", content);
            var result = await response.Content.ReadAsStringAsync();

            return Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
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

            var response = await _httpClient.DeleteAsync($"http://api_muestras:3002/v1/muestras/{id}");
            var content = await response.Content.ReadAsStringAsync();

            return Content(content, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }
    }

    [ApiController]
    [Route("muestras/detalle")]
    public class MuestrasDetalleController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly RedisService _redisService;

        public MuestrasDetalleController(IHttpClientFactory httpClientFactory, RedisService redisService)
        {
            _httpClient = httpClientFactory.CreateClient();
            _redisService = redisService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
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

            var response = await _httpClient.GetAsync($"http://api_muestras:3002/v1/muestras/{id}");
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }
    }

    [ApiController]
    [Route("muestras/usuario")]
    public class MuestrasPorUsuarioController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly RedisService _redisService;

        public MuestrasPorUsuarioController(IHttpClientFactory httpClientFactory, RedisService redisService)
        {
            _httpClient = httpClientFactory.CreateClient();
            _redisService = redisService;
        }

        [HttpGet("{idusuario}")]
        public async Task<IActionResult> Get(string idusuario)
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

            var response = await _httpClient.GetAsync($"http://api_muestras:3002/v1/muestras/usuario/{idusuario}");
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }
    }

    [ApiController]
    [Route("muestras/resultados")]
    public class MuestrasResultadosController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly RedisService _redisService;

        public MuestrasResultadosController(IHttpClientFactory httpClientFactory, RedisService redisService)
        {
            _httpClient = httpClientFactory.CreateClient();
            _redisService = redisService;
        }

        // Registrar resultados (POST)
        [HttpPost("{id}")]
        public async Task<IActionResult> RegistrarResultados(string id, [FromBody] MuestraUpdate data)
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

            var json = JsonSerializer.Serialize(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PutAsync($"http://api_muestras:3002/v1/muestras/resultados/{id}", content);
            var result = await response.Content.ReadAsStringAsync();

            return Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }

        // Editar resultados (PUT)
        [HttpPut("{id}")]
        public async Task<IActionResult> EditarResultados(string id, [FromBody] MuestraUpdate data)
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

            var json = JsonSerializer.Serialize(data, JsonHelper.CamelCaseIgnoreNull);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PutAsync($"http://api_muestras:3002/v1/muestras/resultados/editar/{id}", content);
            var result = await response.Content.ReadAsStringAsync();

            return Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }
    }
    
    [ApiController]
    [Route("muestras/resultados/enviar")]
    public class MuestrasResultadosSendController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly RedisService _redisService;

        public MuestrasResultadosSendController(IHttpClientFactory httpClientFactory, RedisService redisService)
        {
            _httpClient = httpClientFactory.CreateClient();
            _redisService = redisService;
        }

        [HttpPost("{muestraId}")]
        public async Task<IActionResult> RegistrarResultados(string muestraId)
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

            /*
            //Validar rol
            string rolToken = JwtHelper.GetUserRolFromToken(token);
            if (rolToken!="admin" && rolToken!="laboratory" && rolToken!="accounting") {
                return Unauthorized("No autorizado");
            }
            */

            var content = new StringContent("", Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"http://api_muestras:3002/v1/muestras/resultados/send/{muestraId}", content);
            var result = await response.Content.ReadAsStringAsync();

            return Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }
    }

}
