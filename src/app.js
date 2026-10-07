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

import { productRepository } from "./repositories/index.js";
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
    try {
        const result = await productRepository.getProducts(
            {},
            {
                limit: 100,
                page: 1,
                lean: true,
            }
        );
        socket.emit("updateProducts", result.docs);
    } catch (error) {
        console.error(
            "Error al obtener productos:",
            error.message
        );
    }

    // Agregar producto
    socket.on("addProduct", async (product) => {
        try {
            await productRepository.createProduct(product);
            const result = await productRepository.getProducts(
                {},
                {
                    limit: 100,
                    page: 1,
                    lean: true,
                }
            );
            io.emit("updateProducts", result.docs);
        } catch (error) {
            console.error(
                "Error al agregar producto:",
                error.message
            );
        }
    });

    // Eliminar producto
    socket.on("deleteProduct", async (id) => {
        try {
            await productRepository.deleteProduct(id);
            const result = await productRepository.getProducts(
                {},
                {
                    limit: 100,
                    page: 1,
                    lean: true,
                }
            );
            io.emit("updateProducts", result.docs);
        } catch (error) {
            console.error(
                "Error al eliminar producto:",
                error.message
            );
        }
    });
});

// Levantar servidor
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});