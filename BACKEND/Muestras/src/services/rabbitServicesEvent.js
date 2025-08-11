import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_HOST;
const RABBITMQ_EXCHANGE = "muestra_event";
const RABBITMQ_ROUTING_KEY = "muestra.sendReport";

export async function muestraSendResults(email, muestra) {
    let connection;
    try {
        connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertExchange(RABBITMQ_EXCHANGE, "topic", { durable: true });

        const message = JSON.stringify({ 
            email, 
            muestra 
        });
        channel.publish(RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY, Buffer.from(message));

        console.log(`exchange "${RABBITMQ_EXCHANGE}", routing key "${RABBITMQ_ROUTING_KEY}": ${message}`);
    } catch (error) {
        console.error("Error publicando evento:", error);
    } finally {
        if (connection) {
            setTimeout(() => {
                connection.close();
            }, 500);
        }
    }
}
