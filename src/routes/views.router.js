import { Router } from "express";
import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";

const router = Router();

router.get(["/", "/products"], async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const result = await productModel.paginate(
            {},
            {
                page,
                limit,
                lean: true,
            }
        );

        res.render("home", {
            products: result.docs,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            totalPages: result.totalPages,
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get("/realtimeproducts", async (req, res) => {
    try {
        const products = await productModel.find().lean();

        res.render("realTimeProducts", { products });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get("/products/:pid", async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid).lean();

        if (!product) {
            return res.status(404).send("Producto no encontrado");
        }

        res.render("productDetail", { product });
    } catch (error) {
        res.status(400).send("ID de producto inválido");
    }
});

router.get("/carts/:cid", async (req, res) => {
    try {
        const cart = await cartModel
            .findById(req.params.cid)
            .populate("products.product")
            .lean();

        if (!cart) {
            return res.status(404).send("Carrito no encontrado");
        }

        res.render("cart", {
            cart,
        });

    } catch (error) {
        res.status(400).send("ID de carrito inválido");
    }
});

export default router;