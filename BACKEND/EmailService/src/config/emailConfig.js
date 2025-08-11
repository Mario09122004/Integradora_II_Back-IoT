import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

dotenv.config();

// Configuración del transporte de Nodemailer
const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

// Configuración de Handlebars
transport.use('compile', hbs({
    viewEngine: {
        extname: '.hbs',
        layoutsDir: path.resolve('./src/views'), // Directorio donde están las plantillas
        defaultLayout: false, // Nombre del archivo de layout (views/emails/main.hbs)
    },
    viewPath: path.resolve('./src/views'),
    extName: '.hbs'
}));

export default transport;
