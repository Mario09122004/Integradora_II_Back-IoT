import redis from 'redis';

// Creamos el cliente Redis
const redisClient = redis.createClient({
    url: 'redis://token_cache:6379'
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

// Función de conexión con reintento
async function conectarRedis(reintentoMs = 5000) {
    while (true) {
        try {
            await redisClient.connect();
            console.log('Conectado a Redis correctamente');
            break;
        } catch (err) {
            console.error('Error al conectar a Redis:', err);
            console.log(`Reintentando conexión en ${reintentoMs / 1000} segundos...`);
            await new Promise(resolve => setTimeout(resolve, reintentoMs));
        }
    }
}

conectarRedis();

export default redisClient;