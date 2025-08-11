import amqp from 'amqplib';
import dotenv from 'dotenv';
import { sendEmailWelcome, sendEmailForgetPassword, sendEmailResultadosConPDF } from '../controller/emailController.js';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_HOST;

export async function userEvents() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL, { frameMax: 8192 });
        const channel = await connection.createChannel();
        
        const exchange = 'user_event';
        const queue = 'user_created_queue';
        const routingKey = 'user.created';

        await channel.assertExchange(exchange, 'topic', { durable: true });
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, routingKey);

        console.log(`Waiting for a message in ${queue}`);
        channel.consume(queue, async (msg) => {
            if (msg != null) {
                const response = JSON.parse(msg.content.toString());
                //console.log(response);

                // Enviar correo
                try {
                    await sendEmailWelcome(response.user, response.pass);
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error sending welcome email:', error);
                    channel.nack(msg, false, true); // Requeue the message
                }
            }
        }, { noAck: false });

        connection.on('close', () => {
            console.error('Connection closed, attempting to reconnect in 5 seconds');
            setTimeout(userEvents, 5000);
        });
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error.message);
        console.log('Retrying in 5 seconds');
        setTimeout(userEvents, 5000);
    }
}

export async function userEventForget() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL, { frameMax: 8192 });
        const channel = await connection.createChannel();
        
        const exchange = 'user_event_forget';
        const queue = 'user_forget_queue';
        const routingKey = 'user.forget';

        await channel.assertExchange(exchange, 'topic', { durable: true });
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, routingKey);

        console.log(`Waiting for a message in ${queue} (forget password)`);
        channel.consume(queue, async (msg) => {
            if (msg != null) {
                const response = JSON.parse(msg.content.toString());
                //console.log(response);

                // Enviar correo
                try {
                    await sendEmailForgetPassword(response.username, response.newPassword);
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error sending forget password email:', error);
                    channel.nack(msg, false, true); // Requeue the message
                }
            }
        }, { noAck: false });

        connection.on('close', () => {
            console.error('Connection closed, attempting to reconnect in 5 seconds');
            setTimeout(userEvents, 5000);
        });
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error.message);
        console.log('Retrying in 5 seconds');
        setTimeout(userEvents, 5000);
    }
}

export async function muestraEnvioResultados() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL, { frameMax: 8192 });
        const channel = await connection.createChannel();
        
        const exchange = 'muestra_event';
        const queue = 'muestra_event_queue';
        const routingKey = 'muestra.sendReport';

        await channel.assertExchange(exchange, 'topic', { durable: true });
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, routingKey);

        console.log(`Waiting for a message in ${queue} (forget password)`);
        channel.consume(queue, async (msg) => {
            if (msg != null) {
                const response = JSON.parse(msg.content.toString());
                
                // Enviar correo
                try {
                    await sendEmailResultadosConPDF({ email: response.email.correo, muestra: response.muestra });

                    channel.ack(msg);

                    console.log("Resultados enviados");
                } catch (error) {
                    console.error('Error sending forget password email:', error);
                    channel.nack(msg, false, true); // Requeue the message
                }
            }
        }, { noAck: false });

        connection.on('close', () => {
            console.error('Connection closed, attempting to reconnect in 5 seconds');
            setTimeout(userEvents, 5000);
        });
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error.message);
        console.log('Retrying in 5 seconds');
        setTimeout(userEvents, 5000);
    }
}
