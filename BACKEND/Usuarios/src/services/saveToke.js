import redisClient from './../config/redisConfig.js';

export async function guardarTokenEnRedis(userId, token) {
    try {
        const redisKey = `token:${userId}`;

        await redisClient.set(redisKey, token, { EX: 30*60 });

        console.log(`Token guardado en Redis para el usuario ${userId}`);
    } catch (error) {
        console.error('Error al guardar el token en Redis:', error);
        throw error;
    }
}
