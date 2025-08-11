using StackExchange.Redis;
using System.Threading.Tasks;

namespace OnlyESBservice.Services
{
    public class RedisService
    {
        private readonly IDatabase _db;

        public RedisService(string connectionString)
        {
            var redis = ConnectionMultiplexer.Connect(connectionString);
            redis.GetDatabase().Ping();
            _db = redis.GetDatabase();
        }

        public async Task<bool> TokenExistsAsync(string userId, string token)
        {
            string redisKey = $"token:{userId}";
            string storedToken = await _db.StringGetAsync(redisKey);
            return storedToken == token;
        }

        public async Task RefreshTokenTTLAsync(string userId)
        {
            string redisKey = $"token:{userId}";

            /*
            //Test de tiempo de vida
            TimeSpan? ttl = await _db.KeyTimeToLiveAsync(redisKey);

            if (ttl.HasValue){
                Console.WriteLine($"TTL del token para {redisKey}: {ttl.Value.TotalMinutes} minutos");
            }else{
                Console.WriteLine($"La clave {redisKey} no tiene tiempo de expiración o no existe.");
            }
            */

            await _db.KeyExpireAsync(redisKey, TimeSpan.FromMinutes(30));
        }

        public async Task<bool> DeleteTokenAsync(string userId)
        {
            string redisKey = $"token:{userId}";
            return await _db.KeyDeleteAsync(redisKey);
        }
    }
}
