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
    [Route("analisis")]
    public class AnalisisController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly RedisService _redisService;

        public AnalisisController(IHttpClientFactory httpClientFactory,  RedisService redisService)
        {
            _httpClient = httpClientFactory.CreateClient();
            _redisService = redisService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var response = await _httpClient.GetAsync($"http://api_analysis:3003/v1/analisis");
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Analisis data)
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

            var response = await _httpClient.PostAsync("http://api_analysis:3003/v1/analisis", content);
            var result = await response.Content.ReadAsStringAsync();

            return Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }

        [HttpDelete("{path}")]
        public async Task<IActionResult> Delete(string path)
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

            var response = await _httpClient.DeleteAsync($"http://api_analysis:3003/v1/analisis/{path}");
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }

        [HttpPut("{path}")]
        public async Task<IActionResult> Put([FromBody] Analisis data, string path)
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

            var response = await _httpClient.PutAsync($"http://api_analysis:3003/v1/analisis/{path}", content);

            var result = await response.Content.ReadAsStringAsync();
            return Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json");

        }
    }

    [ApiController]
    [Route("analisis/search")]
    public class ProxyDetailsController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly RedisService _redisService;

        public ProxyDetailsController(IHttpClientFactory httpClientFactory, RedisService redisService)
        {
            _httpClient = httpClientFactory.CreateClient();
            _redisService = redisService;
        }

        [HttpGet("{path}")]
        public async Task<IActionResult> Get(string path)
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

            var response = await _httpClient.GetAsync($"http://api_analysis:3003/v1/analisis/search/{path}");
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }
    }

    [ApiController]
    [Route("analisis/search/name")]
    public class ProxySearchController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly RedisService _redisService;

        public ProxySearchController(IHttpClientFactory httpClientFactory, RedisService redisService)
        {
            _httpClient = httpClientFactory.CreateClient();
            _redisService = redisService;
        }

        [HttpGet("{path}")]
        public async Task<IActionResult> Get(string path)
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
            
            var response = await _httpClient.GetAsync($"http://api_analysis:3003/v1/analisis/search/name/{path}");
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }
    }
}
