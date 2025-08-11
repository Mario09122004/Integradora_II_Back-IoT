import mongoose from "mongoose";

const { Schema, model } = mongoose;

const quimicaSanguineaSchema = new Schema({
  glucosa: Number,
  glucosaPost: Number,
  acidoUrico: Number,
  urea: Number,
  creatinina: Number,
  colesterol: Number,
  LDR: Number,
  gGT: Number
}, { _id: false });

const biometriaHematicaSchema = new Schema({
  formulaRoja: {
    hemoglobina: Number,
    hematocrito: Number,
    eritrocitos: Number,
    conMediaHb: Number,
    volGlobularMedia: Number,
    HBCorpuscularMedia: Number,
    plaqutas: Number
  },
  formulaBlanca: {
    cuentaLeucocitaria: Number,
    linfocitos: Number,
    monocitos: Number,
    segmentados: Number,
    enBanda: Number,
    neutrofilosT: Number,
    eosinofilos: Number,
    basofilos: Number
  }
}, { _id: false });

const muestraSchema = new Schema({
  observaciones: { type: String },
  nombrePaciente: { type: String, required: true },
  fechaTomaMuestra: { type: Date, required: true, default: Date.now },
  idusuario: { type: String, ref: 'Usuario', required: true },
  tipoMuestra: { type: String, enum: ['quimicaSanguinea', 'biometriaHematica'], required: true },

  // Subdocumentos
  quimicaSanguinea: { type: quimicaSanguineaSchema, required: false },
  biometriaHematica: { type: biometriaHematicaSchema, required: false },

  tipo: { type: String },
  status: { type: Boolean, default: true, required: true },
  statusShowClient: { type: Boolean, default: false, required: true },
  pedidoId: { type: String, ref: 'Pedido' },
  createDate: { type: Date, default: Date.now },
  deleteDate: { type: Date }
});

muestraSchema.pre("validate", function (next) {
  const tieneQuimica = !!this.quimicaSanguinea;
  const tieneBiometria = !!this.biometriaHematica;

  if (tieneQuimica && tieneBiometria) {
    return next(new Error("Solo se puede registrar uno de los campos: quimicaSanguinea o biometriaHematica, no ambos."));
  }

  // Si se envió resultados, deben coincidir con el tipoMuestra
  if (this.tipoMuestra === 'quimicaSanguinea' && tieneBiometria) {
    return next(new Error("El tipo de muestra es 'quimicaSanguinea', no se debe enviar 'biometriaHematica'."));
  }

  if (this.tipoMuestra === 'biometriaHematica' && tieneQuimica) {
    return next(new Error("El tipo de muestra es 'biometriaHematica', no se debe enviar 'quimicaSanguinea'."));
  }

  return next();
});

const Muestra = model("Muestra", muestraSchema, "muestras");

export default Muestra;
