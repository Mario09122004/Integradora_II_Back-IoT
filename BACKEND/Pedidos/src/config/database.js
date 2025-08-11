import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URI_LOCAL || 'mongodb://admin:admin@db_proyect:27017/laboratorio?authSource=admin';

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUrl);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log("MongoDB connection failed:", error);
        setTimeout(connectDB, 5000);
    }
};

export default connectDB;