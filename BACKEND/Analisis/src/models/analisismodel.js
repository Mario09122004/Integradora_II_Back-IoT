import mongoose from "mongoose";

const { Schema, model } = mongoose;

const analisiSchema = new Schema({
    nombre: { 
        type: String, 
        required: true
    },
    costo: {
        type: Number,
        required: true
    },
    diasEspera: {
        type: Number
    },
    descripcion: {
        type: String,
        require: true
    },
    status: {
        type: Boolean,
        default: true,
        require: true,
    },
    createDate: {
        type: Date,
        default: Date.now,
    },
    deleteDate: {
        type: Date,
    },
});

const Analisis = model("Analisis", analisiSchema, "analisis");

export default Analisis;