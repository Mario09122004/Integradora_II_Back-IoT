import axios from "axios";

const apiUrl = process.env.API_WHATSAPP;
const headers = {  
"Content-Type": "application/json",
"apikey": "admin"
};
const numPhone = process.env.NUMPHONE;

export async function enviarWhatsApp(message) {
    try {
        const jsonPrecaucion = {
            number: numPhone,
            textMessage: {
                text: message
            }
        };

        await axios.post(apiUrl, jsonPrecaucion, { headers });
        console.log("Mensaje enviado");
    } catch (error) {
        console.error('Error al enviar mensaje', error);
        throw error;
    }
}
