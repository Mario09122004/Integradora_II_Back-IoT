import express from 'express';
import { body } from 'express-validator';
import {
  crearPedido,
  obtenerPedidos,
  obtenerPedidoPorId,
  actualizarPedido,
  eliminarPedido,
  obtenerPedidosPorUsuario
} from '../controllers/pedidosController.js';

const router = express.Router();

// Middleware para manejar errores de manera centralizada
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Rutas para pedidos
router.post('/', [
  body('usuarioId').isMongoId().withMessage('El ID de usuario no es válido'),
  body('analisis').isArray({ min: 1 }).withMessage('Debe haber al menos un análisis'),
  body('analisis.*.precio').isFloat({ gt: 0 }).withMessage('El precio del análisis debe ser mayor que cero'),
  body('porcentajeDescuento').optional().isFloat({ min: 0, max: 100 }).withMessage('El descuento debe estar entre 0 y 100'),
  body('anticipo.monto')
    .optional()
    .isFloat({ min: 0 }).withMessage('El monto del anticipo no puede ser negativo')
    .custom((montoAnticipo, { req }) => {
      const { analisis, porcentajeDescuento } = req.body;
      if (!analisis || !Array.isArray(analisis)) {
        return true; 
      }
      const subtotal = analisis.reduce((sum, item) => sum + (item.precio || 0), 0);
      const total = subtotal * (1 - ((porcentajeDescuento || 0) / 100));

      if (montoAnticipo > total) {
        throw new Error('El monto del anticipo no puede ser mayor que el total del pedido.');
      }
      return true;
    })
], asyncHandler(crearPedido));
router.get('/', asyncHandler(obtenerPedidos));
router.get('/usuario/:usuarioId', asyncHandler(obtenerPedidosPorUsuario));
router.get('/:id', asyncHandler(obtenerPedidoPorId));
router.put('/:id', asyncHandler(actualizarPedido));
router.delete('/:id', asyncHandler(eliminarPedido));

export default router;
