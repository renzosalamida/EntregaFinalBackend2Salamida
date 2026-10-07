import "dotenv/config";
import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);

        console.log("Conectado a MongoDB");
    } catch (error) {
        console.error("Error al conectar MongoDB");
        console.error(error);
        process.exit(1);
    }
};