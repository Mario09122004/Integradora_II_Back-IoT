import TempWet from "../models/temperatureWet.js";
import { enviarWhatsApp } from './../service/whatsapp.js'

const datosDispositivos = {};
const limitTemp = process.env.TEMPERATURE;

export const recibirDatos = async (req, res) => {
    const { id, ldr, pass } = req.body;

    if(pass!=process.env.PASSWORDIOTLDR){
      return res.status(400).json({ error: "Credenciales incorrectas" });
    }

    if (!datosDispositivos[id]) {
        datosDispositivos[id] = {
            ldr,
            ldrMax: ldr,
            ldrMin: ldr,
            timestamp: new Date(),
            alertaContaminadoEnviada: false,
            alertaAdvertenciaEnviada: false
        };
    } else {
        datosDispositivos[id].ldr = ldr;
        datosDispositivos[id].timestamp = new Date();

        if (ldr > datosDispositivos[id].ldrMax) {
            datosDispositivos[id].ldrMax = ldr;
        }
        if (ldr < datosDispositivos[id].ldrMin) {
            datosDispositivos[id].ldrMin = ldr;
        }
    }

    try {
        if (ldr > 30 && !datosDispositivos[id].alertaContaminadoEnviada) {
            enviarWhatsApp(`❌ Muestra del contenedor ${id}, están contaminadas`);

            datosDispositivos[id].alertaContaminadoEnviada = true;
            datosDispositivos[id].alertaAdvertenciaEnviada = true;

        } else if (
            ldr > 15 &&
            ldr <= 30 &&
            !datosDispositivos[id].alertaContaminadoEnviada &&
            !datosDispositivos[id].alertaAdvertenciaEnviada
        ) {
            enviarWhatsApp(`⚠️ Muestra del contenedor ${id}, están en precaución`);
            datosDispositivos[id].alertaAdvertenciaEnviada = true;
        }

    } catch (error) {
        console.error("❌ Error al enviar mensaje:", error.message);
    }

    res.status(200).json({ mensaje: "Datos recibidos correctamente" });
};

// Obtiene el último dato registrado junto con min y max
export const obtenerUltimoDato = (req, res) => {
    const id = req.params.id;

    if (datosDispositivos[id]) {
        res.status(200).json({
            id: id,
            ldr: datosDispositivos[id].ldr,
            ldrMax: datosDispositivos[id].ldrMax,
            ldrMin: datosDispositivos[id].ldrMin,
            timestamp: datosDispositivos[id].timestamp
        });
    } else {
        res.status(404).json({ mensaje: "No hay datos para este dispositivo" });
    }
};

export const resetearMinMax = async (req, res) => {
    const id = req.params.id;

    if (datosDispositivos[id]) {
        const ldrActual = datosDispositivos[id].ldr;
        datosDispositivos[id].ldrMax = ldrActual;
        datosDispositivos[id].ldrMin = ldrActual;

        datosDispositivos[id].alertaContaminadoEnviada = false;
        datosDispositivos[id].alertaAdvertenciaEnviada = false;

        enviarWhatsApp(`♻️ Reinicio del contenedor ${id}`);

        res.status(200).json({
            mensaje: `Valores reseteados para el dispositivo ${id}`
        });
    } else {
        res.status(404).json({ mensaje: "No hay datos para este dispositivo" });
    }
};

const estadoTemperatura = {};

export const registrarDatosTempWet = async (req, res) => {
  try {
    const { deviceId, ds18b20, dht11_temp, dht11_hum, pass } = req.body;

    if(pass!=process.env.PASSWORDIOTTEMP){
      return res.status(400).json({ error: "Credenciales incorrectas" });
    }

    if (!deviceId || ds18b20 === undefined || dht11_hum === undefined) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const nuevoDato = new TempWet({
      deviceId,
      tempRecipient: ds18b20,
      tempLab: dht11_temp,
      wetLab: dht11_hum
    });

    await nuevoDato.save();

    if (!estadoTemperatura[deviceId]) {
      estadoTemperatura[deviceId] = {
        alertaCriticaEnviada: false
      };
    }

    const estadoActual = estadoTemperatura[deviceId];

    if (ds18b20 > limitTemp && !estadoActual.alertaCriticaEnviada) {
      await enviarWhatsApp(`🔥 Temperatura crítica en contenedor ${deviceId}`);
      estadoActual.alertaCriticaEnviada = true;
    }

    if (ds18b20 <= limitTemp && estadoActual.alertaCriticaEnviada) {
      await enviarWhatsApp(`✅ Temperatura normalizada en contenedor ${deviceId}`);
      estadoActual.alertaCriticaEnviada = false;
    }

    return res.status(201).json({ mensaje: "Datos guardados correctamente" });
  } catch (error) {
    console.error("Error al guardar datos:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
};

// Consultar datos por TempWet
export const obtenerDatosTempWet = async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res.status(400).json({ error: "Falta el deviceId en la URL" });
    }

    const datos = await TempWet.find({ deviceId }).sort({ createdAt: -1 });

    if (datos.length === 0) {
      return res.status(404).json({ mensaje: "No se encontraron datos para este deviceId" });
    }

    return res.status(200).json(datos);
  } catch (error) {
    console.error("Error al obtener datos:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
};