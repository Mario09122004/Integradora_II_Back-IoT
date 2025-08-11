import express from "express";
import bodyParser from "body-parser";
import muestrasRoutes from "./routes/muestrasRoutes.js";

const app = express();

app.use(bodyParser.json());
app.use('/v1/muestras', muestrasRoutes);

export default app;