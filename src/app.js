import "dotenv/config";
import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import http from "http";
import passport from "passport";
import cookieParser from "cookie-parser";

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import usersRouter from "./routes/users.router.js";
import sessionsRouter from "./routes/sessions.router.js";

import productModel from "./models/product.model.js";
import { connectDB } from "./config/mongoDB.js";
import { initializePassport } from "./config/passport.config.js";


const app = express();
const server = http.createServer(app);
const io = new Server(server);

await connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

initializePassport();
app.use(passport.initialize());

// Archivos estáticos
app.use(express.static("src/public"));

// Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/", viewsRouter);

// Socket.IO
io.on("connection", async (socket) => {
    console.log("Cliente conectado");

    const products = await productModel.find().lean();
    socket.emit("updateProducts", products);

    // Agregar producto
    socket.on("addProduct", async (product) => {
        await productModel.create(product);

        const updatedProducts = await productModel.find().lean();
        io.emit("updateProducts", updatedProducts);
    });

    // Eliminar producto
    socket.on("deleteProduct", async (id) => {
        await productModel.findByIdAndDelete(id);

        const updatedProducts = await productModel.find().lean();
        io.emit("updateProducts", updatedProducts);
    });
});

// Levantar servidor
server.listen(8080, () => {
    console.log("Servidor escuchando en puerto 8080");
});