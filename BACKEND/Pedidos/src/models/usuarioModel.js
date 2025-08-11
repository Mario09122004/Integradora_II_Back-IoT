import mongoose from 'mongoose';

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String },
  apellidoPaterno: { type: String },
  apellidoMaterno: { type: String },
  correo: { type: String }
});

// Evitar error de sobreescritura si el modelo ya existe
export default mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);
