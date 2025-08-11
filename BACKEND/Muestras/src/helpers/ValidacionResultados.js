import Usuario from '../models/Usuario.js';
import Pedido from '../models/pedidoModel.js';

export function validarQuimicaSanguinea(data) {
  const campos = ['glucosa', 'glucosaPost', 'acidoUrico', 'urea', 'creatinina', 'colesterol', 'LDR', 'gGT'];
  for (const campo of campos) {
    if (typeof data[campo] !== 'number' || isNaN(data[campo]) || data[campo] < 0) {
      return `El campo "${campo}" en química sanguínea debe ser un número positivo válido.`;
    }
  }
  return null;
}

export function validarBiometriaHematica(data) {

  console.log(data);

  if (typeof data !== 'object' || !data.formulaRoja || !data.formulaBlanca) {
    return 'Faltan "formulaRoja" o "formulaBlanca" en biometría hemática.';
  }

  const formulaRojaCampos = ['hemoglobina', 'hematocrito', 'eritrocitos', 'conMediaHb', 'volGlobularMedia', 'HBCorpuscularMedia', 'plaqutas'];
  for (const campo of formulaRojaCampos) {
    const valor = data.formulaRoja[campo];
    if (typeof valor !== 'number' || isNaN(valor) || valor < 0) {
      return `El campo "${campo}" en formulaRoja debe ser un número positivo válido.`;
    }
  }

  const formulaBlancaCampos = ['cuentaLeucocitaria', 'linfocitos', 'monocitos', 'segmentados', 'enBanda', 'neutrofilosT', 'eosinofilos', 'basofilos'];
  for (const campo of formulaBlancaCampos) {
    const valor = data.formulaBlanca[campo];
    if (typeof valor !== 'number' || isNaN(valor) || valor < 0) {
      return `El campo "${campo}" en formulaBlanca debe ser un número positivo válido.`;
    }
  }

  return null;
}

export async function validarDatosMuestra(body) {
  const { observaciones, nombrePaciente, idusuario, tipoMuestra, pedidoId } = body;

  const requiredFields = ['nombrePaciente', 'idusuario', 'tipoMuestra', 'pedidoId'];
  const missingFields = requiredFields.filter(field => !body[field]);

  if (missingFields.length > 0) {
    return { error: true, message: `Faltan los siguientes campos: ${missingFields.join(', ')}` };
  }

  if (!isNaN(nombrePaciente)) {
    return { error: true, message: 'El nombre debe ser una cadena de caracteres' };
  }

  if (observaciones != null && typeof observaciones === 'string' && observaciones.trim() !== '') {
    if (typeof observaciones !== 'string' || !isNaN(observaciones)) {
      return { error: true, message: 'Las observaciones deben ser una cadena de caracteres válida' };
    }
  }

  // Validar existencia usuario
  const usuario = await Usuario.findById(idusuario);
  if (!usuario) {
    return { error: true, message: 'El idusuario debe de existir' };
  }

  // Validar tipoMuestra
  if (tipoMuestra !== "biometriaHematica" && tipoMuestra !== "quimicaSanguinea") {
    return { error: true, message: 'El tipoMuestra debe de ser biometriaHematica o quimicaSanguinea' };
  }

  // Validar existencia pedido
  const pedido = await Pedido.findById(pedidoId);
  if (!pedido) {
    return { error: true, message: 'El pedidoId debe de existir' };
  }

  return { error: false };
}

export async function validarEdicionMuestra(data) {

  if ('nombrePaciente' in data) {
    if (!data.nombrePaciente || !isNaN(data.nombrePaciente)) {
      return { error: true, message: 'El nombrePaciente debe ser una cadena de caracteres válida.' };
    }
  }

  if ('observaciones' in data) {
    if (data.observaciones != null && typeof data.observaciones === 'string' && data.observaciones.trim() !== '') {
      if (typeof data.observaciones !== 'string' || !isNaN(data.observaciones)) {
        return { error: true, message: 'Las observaciones deben ser una cadena de caracteres válida.' };
      }
    }
  }

  if ('idusuario' in data) {
    const usuario = await Usuario.findById(data.idusuario);
    if (!usuario) {
      return { error: true, message: 'El idusuario debe existir.' };
    }
  }

  if ('pedidoId' in data) {
    const pedido = await Pedido.findById(data.pedidoId);
    if (!pedido) {
      return { error: true, message: 'El pedidoId debe existir.' };
    }
  }

  return { error: false };
}

export function validarResultadosEdicion({ quimicaSanguinea, biometriaHematica }) {
  // Validar quimicaSanguinea solo si fue enviada
  if (quimicaSanguinea) {
    const camposQS = ['glucosa', 'glucosaPost', 'acidoUrico', 'urea', 'creatinina', 'colesterol', 'LDR', 'gGT'];
    for (const campo of camposQS) {
      if (quimicaSanguinea[campo] !== undefined) {
        if (typeof quimicaSanguinea[campo] !== 'number' || isNaN(quimicaSanguinea[campo]) || quimicaSanguinea[campo] < 0) {
          return { error: true, message: `El campo "${campo}" en química sanguínea debe ser un número positivo válido.` };
        }
      }
    }
  }

  // Validar biometriaHematica solo si fue enviada
  if (biometriaHematica) {
    if (typeof biometriaHematica !== 'object' || (!biometriaHematica.formulaRoja && !biometriaHematica.formulaBlanca)) {
      return { error: true, message: 'Debe enviar al menos formulaRoja o formulaBlanca en biometría hemática.' };
    }

    const camposFR = ['hemoglobina', 'hematocrito', 'eritrocitos', 'conMediaHb', 'volGlobularMedia', 'HBCorpuscularMedia', 'plaqutas'];
    if (biometriaHematica.formulaRoja) {
      for (const campo of camposFR) {
        if (biometriaHematica.formulaRoja[campo] !== undefined) {
          if (typeof biometriaHematica.formulaRoja[campo] !== 'number' || isNaN(biometriaHematica.formulaRoja[campo]) || biometriaHematica.formulaRoja[campo] < 0) {
            return { error: true, message: `El campo "${campo}" en formulaRoja debe ser un número positivo válido.` };
          }
        }
      }
    }

    const camposFB = ['cuentaLeucocitaria', 'linfocitos', 'monocitos', 'segmentados', 'enBanda', 'neutrofilosT', 'eosinofilos', 'basofilos'];
    if (biometriaHematica.formulaBlanca) {
      for (const campo of camposFB) {
        if (biometriaHematica.formulaBlanca[campo] !== undefined) {
          if (typeof biometriaHematica.formulaBlanca[campo] !== 'number' || isNaN(biometriaHematica.formulaBlanca[campo]) || biometriaHematica.formulaBlanca[campo] < 0) {
            return { error: true, message: `El campo "${campo}" en formulaBlanca debe ser un número positivo válido.` };
          }
        }
      }
    }
  }

  return { error: false };
}
