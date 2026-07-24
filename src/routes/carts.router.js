import { Router } from "express";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";

const router = Router();

// Crear un carrito vacío
router.post("/", async (req, res) => {
    try {
        const newCart = await cartModel.create({
            products: [],
        });

        res.status(201).json({
            status: "success",
            payload: newCart,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

// Obtener un carrito por ID con los productos completos
router.get("/:cid", async (req, res) => {
    try {
        const cart = await cartModel
            .findById(req.params.cid)
            .populate("products.product")
            .lean();

        if (!cart) {
            return res.status(404).json({
                status: "error",
                message: "Carrito no encontrado",
            });
        }

        res.json({
            status: "success",
            payload: cart,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: "ID de carrito inválido",
        });
    }
});

// Agregar un producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const product = await productModel.findById(pid);

        if (!product) {
            return res.status(404).json({
                status: "error",
                message: "Producto no encontrado",
            });
        }

        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).json({
                status: "error",
                message: "Carrito no encontrado",
            });
        }

        const productInCart = cart.products.find(
            (item) => item.product.toString() === pid
        );

        if (productInCart) {
            productInCart.quantity += 1;
        } else {
            cart.products.push({
                product: pid,
                quantity: 1,
            });
        }

        await cart.save();

        res.json({
            status: "success",
            payload: cart,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
});

// Eliminar un producto específico del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).json({
                status: "error",
                message: "Carrito no encontrado",
            });
        }

        const initialLength = cart.products.length;

        cart.products = cart.products.filter(
            (item) => item.product.toString() !== pid
        );

        if (cart.products.length === initialLength) {
            return res.status(404).json({
                status: "error",
                message: "El producto no está en el carrito",
            });
        }

        await cart.save();

        res.json({
            status: "success",
            payload: cart,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
});

// Actualizar todos los productos del carrito
router.put("/:cid", async (req, res) => {
    try {
        const { products } = req.body;

        if (!Array.isArray(products)) {
            return res.status(400).json({
                status: "error",
                message: "Products debe ser un arreglo",
            });
        }

        const updatedCart = await cartModel.findByIdAndUpdate(
            req.params.cid,
            { products },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedCart) {
            return res.status(404).json({
                status: "error",
                message: "Carrito no encontrado",
            });
        }

        res.json({
            status: "success",
            payload: updatedCart,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
});

// Actualizar solamente la cantidad de un producto
router.put("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const quantity = Number(req.body.quantity);

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                status: "error",
                message: "La cantidad debe ser un entero mayor a 0",
            });
        }

        const updatedCart = await cartModel.findOneAndUpdate(
            {
                _id: cid,
                "products.product": pid,
            },
            {
                $set: {
                    "products.$.quantity": quantity,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedCart) {


            
            return res.status(404).json({
                status: "error",
                message: "Carrito o producto no encontrado",
            });
        }

        res.json({
            status: "success",
            payload: updatedCart,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
});

// Vaciar completamente el carrito
router.delete("/:cid", async (req, res) => {
    try {
        const updatedCart = await cartModel.findByIdAndUpdate(
            req.params.cid,
            {
                products: [],
            },
            {
                new: true,
            }
        );

        if (!updatedCart) {
            return res.status(404).json({
                status: "error",
                message: "Carrito no encontrado",
            });
        }

        res.json({
            status: "success",
            payload: updatedCart,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
});

export default router;