import Muestra from '../models/muestrasmodel.js';
import { muestraSendResults } from './../services/rabbitServicesEvent.js'
import Usuario from './../models/Usuario.js'
import Pedido from './../models/pedidoModel.js'
import { validarQuimicaSanguinea, validarBiometriaHematica, validarDatosMuestra, validarEdicionMuestra, validarResultadosEdicion } from './../helpers/ValidacionResultados.js'

// Obtener todas las muestras
export const getAllMuestras = async (req, res) => {
    const muestrasList = await Muestra.find();
    return res.json({ muestrasList });
};

// Obtener todas las muestras de un usuario específico
export const getMuestrasPorUsuario = async (req, res) => {
  try {
    const { idusuario } = req.params;

    if (!idusuario) {
      return res.status(400).json({ success: false, message: "El idusuario es requerido." });
    }

    const muestras = await Muestra.find({ idusuario });

    if (muestras.length === 0) {
      return res.status(404).json({ success: false, message: "No se encontraron muestras para este usuario." });
    }

    return res.status(200).json({ success: true, muestras });
  } catch (error) {
    console.error("Error al obtener muestras por usuario:", error);
    return res.status(500).json({ success: false, message: "Error del servidor.", error });
  }
};

// Obtener detalles de una muestra por su ID
export const getDetalleMuestra = async (req, res) => {
  try {
    const { id } = req.params;

    const muestra = await Muestra.findById(id);

    if (!muestra) {
      return res.status(404).json({ success: false, message: 'Muestra no encontrada.' });
    }

    return res.status(200).json({ success: true, muestra });
  } catch (error) {
    console.error("Error al obtener detalles de la muestra:", error);
    return res.status(500).json({ success: false, message: "Error del servidor.", error });
  }
};

// Tomar muestra (crear sin resultados)
export const tomarMuestra = async (req, res) => {
  try {
    const validacion = await validarDatosMuestra(req.body);
    if (validacion.error) {
      return res.status(400).json({ message: validacion.message });
    }

    const {
      observaciones,
      nombrePaciente,
      idusuario,
      tipoMuestra,
      pedidoId
    } = req.body;

    const nuevaMuestra = new Muestra({
      observaciones,
      nombrePaciente,
      idusuario,
      tipoMuestra,
      pedidoId
    });

    await nuevaMuestra.save();

    return res.status(201).json({ success: true, message: 'Muestra tomada correctamente.', muestra: nuevaMuestra });
  } catch (error) {
    console.error("Error al tomar muestra:", error);
    return res.status(500).json({ success: false, message: 'Error al tomar muestra.', error });
  }
};

// Registrar resultados de la muestra
export const registrarResultadosMuestra = async (req, res) => {
  try {
    const { id } = req.params;
    const { quimicaSanguinea, biometriaHematica } = req.body;

    const muestra = await Muestra.findById(id);
    if (!muestra) {
      return res.status(404).json({ success: false, message: 'Muestra no encontrada.' });
    }

    if(muestra.statusShowClient){
      return res.status(400).json({ success: false, message: 'Esta muestra ya tiene resultados' });
    }

    if (muestra.tipoMuestra === 'quimicaSanguinea') {
      if (!quimicaSanguinea) {
        return res.status(400).json({ success: false, message: 'Debe enviar los datos de química sanguínea.' });
      }
      const error = validarQuimicaSanguinea(quimicaSanguinea);
      if (error) {
        return res.status(400).json({ success: false, message: error });
      }
      muestra.quimicaSanguinea = quimicaSanguinea;

    }else if (muestra.tipoMuestra === 'biometriaHematica') {
      if (!biometriaHematica) {
        return res.status(400).json({ success: false, message: 'Debe enviar los datos de biometría hemática.' });
      }
      const error = validarBiometriaHematica(biometriaHematica);
      if (error) {
        return res.status(400).json({ success: false, message: error });
      }

      muestra.biometriaHematica = biometriaHematica;

    }else{
      return res.status(400).json({ success: false, message: 'Debe enviar los datos de algun analisis admintido' });
    }

    muestra.statusShowClient = true;

    const correo = await Usuario.findById(muestra.idusuario).select('correo');

    muestraSendResults(correo, muestra);

    await muestra.save();

    return res.status(200).json({ success: true, message: 'Resultados registrados correctamente.', muestra });
  } catch (error) {
    console.error("Error al registrar resultados:", error);
    return res.status(500).json({ success: false, message: 'Error al registrar resultados.', error });
  }
};


// Eliminar (soft delete)
export const deleteMuestra = async (req, res) => {
    const { muestraId } = req.params;
    const muestra = await Muestra.findById(muestraId);
    if (!muestra) return res.status(404).json({ message: "Muestra no encontrada" });

    muestra.statusShowClient = false;
    muestra.status = false;
    muestra.deleteDate = new Date();
    await muestra.save();
    return res.json({ message: "Muestra eliminada", muestra });
};

// Editar datos generales de una muestra (no incluye resultados)
export const editarMuestra = async (req, res) => {
  try {
    const { id } = req.params;
    const dataAEditar = req.body;

    const muestra = await Muestra.findById(id);
    if (!muestra) {
      return res.status(404).json({ success: false, message: 'Muestra no encontrada.' });
    }

    // Validar sólo los campos que se quieren modificar
    const validacion = await validarEdicionMuestra(dataAEditar);
    if (validacion.error) {
      return res.status(400).json({ message: validacion.message });
    }

    // Actualizar sólo los campos enviados
    if ('observaciones' in dataAEditar) muestra.observaciones = dataAEditar.observaciones;
    if ('nombrePaciente' in dataAEditar) muestra.nombrePaciente = dataAEditar.nombrePaciente;
    if ('idusuario' in dataAEditar) muestra.idusuario = dataAEditar.idusuario;
    if ('pedidoId' in dataAEditar) muestra.pedidoId = dataAEditar.pedidoId;

    await muestra.save();

    return res.status(200).json({ success: true, message: "Muestra actualizada correctamente.", muestra });
  } catch (error) {
    console.error("Error al editar muestra:", error);
    return res.status(500).json({ success: false, message: "Error del servidor.", error });
  }
};


// Editar resultados de una muestra según su tipoMuestra
export const editarResultadosMuestra = async (req, res) => {
  try {
    const { id } = req.params;
    const { quimicaSanguinea, biometriaHematica } = req.body;

    const muestra = await Muestra.findById(id);
    if (!muestra) {
      return res.status(404).json({ success: false, message: 'Muestra no encontrada.' });
    }

    const validacion = validarResultadosEdicion({ quimicaSanguinea, biometriaHematica });
    if (validacion.error) {
      return res.status(400).json({ success: false, message: validacion.message });
    }

    if (muestra.tipoMuestra === 'quimicaSanguinea') {
      if (!quimicaSanguinea) {
        return res.status(400).json({ success: false, message: 'Debe proporcionar datos de química sanguínea.' });
      }
      muestra.quimicaSanguinea = muestra.quimicaSanguinea || {};
      for (const campo in quimicaSanguinea) {
        muestra.quimicaSanguinea[campo] = quimicaSanguinea[campo];
      }

    } else if (muestra.tipoMuestra === 'biometriaHematica') {
      if (!biometriaHematica) {
        return res.status(400).json({ success: false, message: 'Debe proporcionar datos de biometría hemática.' });
      }
      muestra.biometriaHematica = muestra.biometriaHematica || {};

      if (biometriaHematica.formulaRoja) {
        muestra.biometriaHematica.formulaRoja = muestra.biometriaHematica.formulaRoja || {};
        for (const campo in biometriaHematica.formulaRoja) {
          muestra.biometriaHematica.formulaRoja[campo] = biometriaHematica.formulaRoja[campo];
        }
      }

      if (biometriaHematica.formulaBlanca) {
        muestra.biometriaHematica.formulaBlanca = muestra.biometriaHematica.formulaBlanca || {};
        for (const campo in biometriaHematica.formulaBlanca) {
          muestra.biometriaHematica.formulaBlanca[campo] = biometriaHematica.formulaBlanca[campo];
        }
      }

    } else {
      return res.status(400).json({ success: false, message: 'Tipo de muestra no reconocido.' });
    }

    await muestra.save();

    return res.status(200).json({ success: true, message: 'Resultados actualizados correctamente.', muestra });

  } catch (error) {
    console.error("Error al editar resultados de la muestra:", error);
    return res.status(500).json({ success: false, message: "Error del servidor.", error });
  }
};

// Reenvio de resultados
export const sendMuestraAgain = async (req, res) => {
    const { muestraId } = req.params;
    const muestra = await Muestra.findById(muestraId);
    if (!muestra) return res.status(404).json({ message: "Muestra no encontrada" });

    const correo = await Usuario.findById(muestra.idusuario).select('correo');
    muestraSendResults(correo, muestra);
    
    return res.json({ message: "Resultados enviados", muestra });
};