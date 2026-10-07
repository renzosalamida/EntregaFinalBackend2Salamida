import { Router } from "express";
import passport from "passport";
import {
    cartRepository,
    productRepository,
    ticketRepository,
} from "../repositories/index.js";
import { authorization } from "../middlewares/authorization.js";

const router = Router();

// Crear un carrito vacío
router.post("/", async (req, res) => {
    try {
        const newCart = await cartRepository.createCart();

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
        const cart = await cartRepository.getCartByIdPopulated(
            req.params.cid
        );

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

// Agregar producto al carrito - SOLO USER
router.post(
    "/:cid/product/:pid",
    passport.authenticate("current", { session: false }),
    authorization("user"),
    async (req, res) => {
        try {
            const { cid, pid } = req.params;

            const userCartId = req.user.cart?._id
                ? req.user.cart._id.toString()
                : req.user.cart?.toString();

            if (userCartId !== cid) {
                return res.status(403).json({
                    status: "error",
                    message: "No podés modificar un carrito que no te pertenece",
                });
            }

            const product =
                await productRepository.getProductById(pid);

            if (!product) {
                return res.status(404).json({
                    status: "error",
                    message: "Producto no encontrado",
                });
            }

            const cart = await cartRepository.getCartById(cid);

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

            await cartRepository.saveCart(cart);

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
    }
);

// Eliminar un producto específico del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const cart = await cartRepository.getCartById(cid);

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

        await cartRepository.saveCart(cart);

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

        const updatedCart = await cartRepository.updateCart(
            req.params.cid,
            { products }
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

        const updatedCart =
            await cartRepository.updateProductQuantity(
                cid,
                pid,
                quantity
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
        const updatedCart = await cartRepository.emptyCart(
            req.params.cid
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

// Finalizar compra
router.post(
    "/:cid/purchase",
    passport.authenticate("current", { session: false }),
    authorization("user"),
    async (req, res) => {
        try {
            const { cid } = req.params;

            // Verificar que el carrito pertenezca al usuario autenticado
            const userCartId = req.user.cart?._id
                ? req.user.cart._id.toString()
                : req.user.cart?.toString();

            if (userCartId !== cid) {
                return res.status(403).json({
                    status: "error",
                    message: "No podés comprar desde un carrito que no te pertenece",
                });
            }

            // Obtener carrito con productos completos
            const cart =
                await cartRepository.getCartByIdPopulated(cid);

            if (!cart) {
                return res.status(404).json({
                    status: "error",
                    message: "Carrito no encontrado",
                });
            }

            if (cart.products.length === 0) {
                return res.status(400).json({
                    status: "error",
                    message: "El carrito está vacío",
                });
            }

            let totalAmount = 0;
            const productsNotPurchased = [];
            const purchasedProducts = [];

            // Revisar stock producto por producto
            for (const item of cart.products) {
                const product = item.product;

                if (!product) {
                    continue;
                }

                if (product.stock >= item.quantity) {
                    const newStock =
                        product.stock - item.quantity;

                    await productRepository.updateProductStock(
                        product._id,
                        newStock
                    );

                    totalAmount +=
                        product.price * item.quantity;

                    purchasedProducts.push({
                        product: product._id,
                        title: product.title,
                        quantity: item.quantity,
                        price: product.price,
                    });
                } else {
                    productsNotPurchased.push({
                        product: product._id,
                        quantity: item.quantity,
                    });
                }
            }

            // Si ningún producto pudo comprarse, no generamos ticket
            if (purchasedProducts.length === 0) {
                return res.status(400).json({
                    status: "error",
                    message:
                        "No hay stock suficiente para los productos del carrito",
                    productsNotPurchased,
                });
            }

            // Crear ticket
            const ticket =
                await ticketRepository.createTicket({
                    code: `TICKET-${Date.now()}-${Math.random()
                        .toString(36)
                        .substring(2, 8)
                        .toUpperCase()}`,
                    amount: totalAmount,
                    purchaser: req.user.email,
                });

            // El carrito conserva solamente los productos
            // que no pudieron comprarse
            await cartRepository.updateCart(cid, {
                products: productsNotPurchased,
            });

            res.status(201).json({
                status: "success",
                message:
                    productsNotPurchased.length > 0
                        ? "Compra realizada parcialmente"
                        : "Compra realizada correctamente",
                ticket,
                purchasedProducts,
                productsNotPurchased,
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: error.message,
            });
        }
    }
);
export default router;