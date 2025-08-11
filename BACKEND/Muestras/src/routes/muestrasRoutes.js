import express from "express";
import {
    getAllMuestras,
    getMuestrasPorUsuario,
    getDetalleMuestra,
    tomarMuestra,
    registrarResultadosMuestra,
    editarMuestra,
    editarResultadosMuestra,
    deleteMuestra,
    sendMuestraAgain
} from "../controllers/muestrasController.js";

const router = express.Router();

//Consultas
router.get('/', getAllMuestras);
router.get("/usuario/:idusuario", getMuestrasPorUsuario);
router.get("/:id", getDetalleMuestra);

//Registrar muestra
router.post("/", tomarMuestra);
router.put("/resultados/:id", registrarResultadosMuestra);

//Dar de baja
router.delete("/:muestraId", deleteMuestra);

//Editar
router.put("/resultados/editar/:id", editarResultadosMuestra);
router.put("/:id", editarMuestra);

//Enviar resultados manualmente
router.post("/resultados/send/:muestraId", sendMuestraAgain);

export default router;