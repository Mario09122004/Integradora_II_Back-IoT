import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as controlador from './controller/controlador.js'

const app = express();

app.use(cors());
app.use(bodyParser.json());

//Rutas para dispositivo LDR
app.post('/data', controlador.recibirDatos);
app.get('/data/:id', controlador.obtenerUltimoDato);
app.delete('/data/:id', controlador.resetearMinMax);

//Rutas para temperatura y humedad
app.post('/tempwet', controlador.registrarDatosTempWet);
app.get('/tempwet/:deviceId', controlador.obtenerDatosTempWet);

export default app;