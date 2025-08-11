using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Text.Json;
using System.Linq;

using OnlyESBservice.Models;
using OnlyESBservice.Services;

namespace OnlyESBservice.Controllers
{
    [ApiController]
    [Route("pedidos")]
    public class PedidosController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly RedisService _redisService;

        public PedidosController(IHttpClientFactory httpClientFactory, RedisService redisService)
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

            var response = await _httpClient.GetAsync("http://api_pedidos:3006/v1/pedidos");
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
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

            var response = await _httpClient.GetAsync($"http://api_pedidos:3006/v1/pedidos/{id}");
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Pedido data)
        {
            if (data == null)
            {
                return BadRequest("El pedido no puede ser nulo");
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

            var response = await _httpClient.PostAsync("http://api_pedidos:3006/v1/pedidos", content);
            var result = await response.Content.ReadAsStringAsync();

            return Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(string id, [FromBody] Pedido data)
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

            var response = await _httpClient.PutAsync($"http://api_pedidos:3006/v1/pedidos/{id}", content);
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

            var response = await _httpClient.DeleteAsync($"http://api_pedidos:3006/v1/pedidos/{id}");
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }
    }

    [ApiController]
    [Route("pedidos/usuario")]
    public class PedidosUsuarioController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly RedisService _redisService;

        public PedidosUsuarioController(IHttpClientFactory httpClientFactory, RedisService redisService)
        {
            _httpClient = httpClientFactory.CreateClient();
            _redisService = redisService;
        }

        [HttpGet("{usuarioId}")]
        public async Task<IActionResult> GetByUsuario(string usuarioId)
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

            var response = await _httpClient.GetAsync($"http://api_pedidos:3006/v1/pedidos/usuario/{usuarioId}");
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }
    }

    [ApiController]
    [Route("pedidos/{id}/anticipo")]
    public class PedidoAnticipoController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly RedisService _redisService;

        public PedidoAnticipoController(IHttpClientFactory httpClientFactory, RedisService redisService)
        {
            _httpClient = httpClientFactory.CreateClient();
            _redisService = redisService;
        }

        [HttpPut]
        public async Task<IActionResult> ActualizarEstadoAnticipo(string id, [FromBody] object data)
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

            var response = await _httpClient.PutAsync($"http://api_pedidos:3006/v1/pedidos/{id}/anticipo", content);
            var result = await response.Content.ReadAsStringAsync();

            return Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }
    }
}
