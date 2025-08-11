import jwt from 'jsonwebtoken';

export const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario._id, correo: usuario.correo, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

export const verificarToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return error;
  }
};