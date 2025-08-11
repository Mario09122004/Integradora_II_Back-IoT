import mongoose from "mongoose";

const { Schema, model } = mongoose;

const tempWetSchema = new Schema({
  deviceId: { 
    type: String, 
    required: true 
  },
  tempRecipient: { // DS18B20
    type: Number,
    required: true
  },
  tempLab: {       // DHT11 temp
    type: Number
  },
  wetLab: {        // DHT11 humedad
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400  //24 horas en segundos
  }
});

const TempWet = model("TempWet", tempWetSchema, "tempWet");

export default TempWet;
