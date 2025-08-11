import express from 'express';
import bodyParser from 'body-parser';
import pedidosRoutes from './routes/pedidosRoutes.js';

const app = express();


app.use(bodyParser.json());

// Rutas
app.use('/v1/pedidos', pedidosRoutes);


export default app;
