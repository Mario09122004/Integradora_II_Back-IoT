import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_HOST;
const RABBITMQ_EXCHANGE = "user_event";
const RABBITMQ_ROUTING_KEY = "user.created";

export async function userCreatedEvent(user, pass) {
    let connection;
    try {
        connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertExchange(RABBITMQ_EXCHANGE, "topic", { durable: true });

        const message = JSON.stringify({ user, pass });
        channel.publish(RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY, Buffer.from(message));

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

const RABBITMQ_EXCHANGE_FORGET = "user_event_forget";
const RABBITMQ_ROUTING_KEY_FORGET = "user.forget";

export async function userForgetEvent(username, newPassword) {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(RABBITMQ_EXCHANGE_FORGET, "topic" ,{ durable:true});

    const message = JSON.stringify({ username, newPassword });
    channel.publish(RABBITMQ_EXCHANGE_FORGET, RABBITMQ_ROUTING_KEY_FORGET, Buffer.from(message));

    setTimeout(() => {
        connection.close();
    }, 5000);
}