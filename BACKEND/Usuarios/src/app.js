import bodyParser from "body-parser";
import express from "express";
import usuarioRoutes from "./routes/usuarioRoutes.js";

const app = express();

app.use(bodyParser.json());

app.use('/v1/usuarios', usuarioRoutes);

export default app;