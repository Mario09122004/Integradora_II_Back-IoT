export function validarDatosUsuario({ correo, rol, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento }) {
  const errores = [];

  // Validar correo
  if (!correo || typeof correo !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    errores.push('El correo debe ser una dirección de correo electrónico válida.');
  }

  // Validar rol
  const rolesValidos = ['admin', 'accounting', 'laboratory', 'patient'];
  if (!rol || !rolesValidos.includes(rol)) {
    errores.push('El rol debe ser uno de los siguientes: admin, accounting, laboratory, patient.');
  }

  // Validar nombre y apellidos
  const camposTexto = [
    { campo: nombre, nombre: 'nombre' },
    { campo: apellidoPaterno, nombre: 'apellidoPaterno' },
    { campo: apellidoMaterno, nombre: 'apellidoMaterno' }
  ];

  for (const { campo, nombre } of camposTexto) {
    if (!campo || typeof campo !== 'string' || !campo.trim() || !isNaN(campo)) {
      errores.push(`El campo ${nombre} debe ser una cadena de caracteres válida.`);
    }
  }

  // Validar fecha de nacimiento
  if (!fechaNacimiento || isNaN(Date.parse(fechaNacimiento))) {
    errores.push('La fecha de nacimiento debe ser una fecha válida.');
  }

  return errores.length > 0 ? { error: true, errores } : { error: false };
}
