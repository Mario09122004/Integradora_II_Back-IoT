import mongoose from 'mongoose';

const { Schema } = mongoose;

const AnalisisPedidoSchema = new mongoose.Schema({
  analisisId: {
    type: Schema.Types.ObjectId,
    ref: 'Analisis',
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  descripcion: String
});

const PedidoSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    default: true,
    required: true
  },
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['pendiente', 'pagado', 'cancelado'],
    default: 'pendiente',
    required: true
  },
  analisis: [AnalisisPedidoSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  porcentajeDescuento: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  notas: String,
  anticipo: {
    monto: {
      type: Number,
      min: 0,
      default: 0
    },
    fechaPago: Date,
    estado: {
      type: String,
      enum: ['pendiente', 'pagado', 'rechazado'],
      default: 'pendiente'
    }
  }
}, {
  timestamps: true
});

PedidoSchema.pre('save', function(next) {
  this.fechaActualizacion = Date.now();
  next();
});

PedidoSchema.methods.calcularTotal = function() {
  const descuento = (this.subtotal * this.porcentajeDescuento) / 100;
  return parseFloat((this.subtotal - descuento).toFixed(2));
};

const Pedido = mongoose.model('Pedido', PedidoSchema);

export default Pedido;
