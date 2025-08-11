import bodyParser from "body-parser";
import express from "express";
import analisisRoutes from "./routes/analisisRoutes.js";

const app = express();

app.use(bodyParser.json());

app.use('/v1/analisis', analisisRoutes);

export default app;