import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import http from "http";

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import ProductManager from "./managers/ProductManager.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const productManager = new ProductManager("./src/data/products.json");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static("src/public"));

// Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

// Socket.IO
io.on("connection", async (socket) => {
    console.log("Cliente conectado");

    // Enviar productos al conectarse
    socket.emit("updateProducts", await productManager.getProducts());

    // Agregar producto
    socket.on("addProduct", async (product) => {
        await productManager.addProduct(product);

        io.emit("updateProducts", await productManager.getProducts());
    });

    // Eliminar producto
    socket.on("deleteProduct", async (id) => {
        await productManager.deleteProduct(id);

        io.emit("updateProducts", await productManager.getProducts());
    });
});

// Levantar servidor
server.listen(8080, () => {
    console.log("Servidor escuchando en puerto 8080");
});