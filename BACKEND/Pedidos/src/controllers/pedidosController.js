import Pedido from '../models/pedidoModel.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

//Crear Pedido
export const crearPedido = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Datos de entrada no válidos');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  try {
    const { usuarioId, analisis, porcentajeDescuento, notas, anticipo } = req.body;
    
    if (!analisis || analisis.length === 0) {
      const error = new Error('Debe incluir al menos un análisis en el pedido');
      error.statusCode = 400;
      throw error;
    }
    
    // Generar IDs para cada análisis si no vienen en la petición
    const analisisConIds = analisis.map(item => ({
      _id: item._id || new mongoose.Types.ObjectId(),
      analisisId: item.analisisId || new mongoose.Types.ObjectId(),
      nombre: item.nombre,
      precio: item.precio,
      descripcion: item.descripcion || ''
    }));
    
    const subtotal = analisisConIds.reduce((sum, analisisItem) => {
      if (!analisisItem.precio || isNaN(analisisItem.precio)) {
        throw new Error(`Precio inválido para el análisis: ${analisisItem.nombre || 'sin nombre'}`);
      }
      return sum + parseFloat(analisisItem.precio);
    }, 0);
    
    const nuevoPedido = new Pedido({
      _id: new mongoose.Types.ObjectId(),
      usuarioId,
      analisis: analisisConIds,
      subtotal,
      porcentajeDescuento: parseFloat(porcentajeDescuento) || 0,
      total: 0,
      notas,
      anticipo: {
        monto: anticipo?.monto || 0,
        fechaPago: null,
        estado: 'pendiente'
      }
    });

    // Calcular el total con descuento
    nuevoPedido.total = nuevoPedido.calcularTotal();
    
    const pedidoGuardado = await nuevoPedido.save();
    
    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: pedidoGuardado
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// Obtener todos los pedidos
export const obtenerPedidos = async (req, res) => {
  try {
    const { usuarioId, estado } = req.query;
    const query = { status: true }; // Solo pedidos activos
    
    if (usuarioId) query.usuarioId = usuarioId;
    if (estado) query.estado = estado;
    
    const pedidos = await Pedido.find(query)
      .populate('usuarioId', 'nombre apellidoPaterno apellidoMaterno correo')
      .sort({ fechaCreacion: -1 });
    
    res.status(200).json({
      success: true,
      count: pedidos.length,
      data: pedidos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los pedidos',
      error: error.message
    });
  }
};

// Obtener un pedido por ID
export const obtenerPedidoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pedido = await Pedido.findById(id)
      .populate('usuarioId', 'nombre apellidoPaterno apellidoMaterno correo');
    
    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: pedido
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el pedido',
      error: error.message
    });
  }
};

// Actualizar un pedido
export const actualizarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, notas, porcentajeDescuento, anticipo } = req.body;
    
    const actualizacion = {};
    
    if (estado) actualizacion.estado = estado;
    if (notas !== undefined) actualizacion.notas = notas;
    if (porcentajeDescuento !== undefined) {
      actualizacion.porcentajeDescuento = parseFloat(porcentajeDescuento);
    }
    
    // Actualizar anticipo si se proporciona
    if (anticipo) {
      actualizacion.anticipo = {
        ...anticipo,
        monto: parseFloat(anticipo.monto) || 0
      };
    }
    
    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      id,
      { $set: actualizacion },
      { new: true, runValidators: true }
    );
    
    if (!pedidoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }
    
    // Recalcular el total si se actualizó el descuento
    if (porcentajeDescuento !== undefined) {
      pedidoActualizado.total = pedidoActualizado.calcularTotal();
      await pedidoActualizado.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Pedido actualizado exitosamente',
      data: pedidoActualizado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el pedido',
      error: error.message
    });
  }
};

// Eliminar un pedido
export const eliminarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pedidoEliminado = await Pedido.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );
    
    if (!pedidoEliminado) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Pedido eliminado exitosamente',
      data: pedidoEliminado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el pedido',
      error: error.message
    });
  }
};

// Obtener pedidos por usuario
export const obtenerPedidosPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { estado } = req.query;
    
    const query = { 
      usuarioId,
      status: true 
    };
    
    if (estado) query.estado = estado;
    
    const pedidos = await Pedido.find(query)
      .populate('usuarioId', 'nombre apellidoPaterno apellidoMaterno correo')
      .sort({ fechaCreacion: -1 });
    
    res.status(200).json({
      success: true,
      count: pedidos.length,
      data: pedidos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los pedidos del usuario',
      error: error.message
    });
  }
};

// Actualizar estado de anticipo
export const actualizarEstadoAnticipo = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!['pendiente', 'pagado', 'rechazado'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado de anticipo no válido'
      });
    }
    
    const actualizacion = {
      'anticipo.estado': estado,
      'anticipo.fechaPago': estado === 'pagado' ? new Date() : null
    };
    
    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      id,
      { $set: actualizacion },
      { new: true, runValidators: true }
    );
    
    if (!pedidoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Estado de anticipo actualizado exitosamente',
      data: pedidoActualizado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado del anticipo',
      error: error.message
    });
  }
};