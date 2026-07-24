import mongoose from "mongoose";

const URI = "mongodb://127.0.0.1:27017/ecommerce";

export const connectDB = async () => {
    try {
        await mongoose.connect(URI);

        console.log("Conectado a MongoDB");
    } catch (error) {
        console.error("Error al conectar MongoDB");

        console.error(error);

        process.exit(1);
    }
};