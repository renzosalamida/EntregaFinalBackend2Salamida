import { Router } from "express";
import productModel from "../models/product.model.js";

const router = Router();

// Obtener productos con paginación, filtros y ordenamiento
router.get("/", async (req, res) => {
    try {
        const {
            limit = 10,
            page = 1,
            sort,
            query,
        } = req.query;

        const filter = {};

        // Filtrar por disponibilidad
        if (query === "true" || query === "false") {
            filter.status = query === "true";
        }

        // Si query no es true o false, se utiliza como categoría
        if (query && query !== "true" && query !== "false") {
            filter.category = query;
        }

        const options = {
            limit: Number(limit),
            page: Number(page),
            lean: true,
        };

        // Ordenamiento por precio
        if (sort === "asc") {
            options.sort = { price: 1 };
        }

        if (sort === "desc") {
            options.sort = { price: -1 };
        }

        const result = await productModel.paginate(filter, options);

        const createLink = (pageNumber) => {
            const params = new URLSearchParams();

            params.set("page", pageNumber);
            params.set("limit", limit);

            if (sort) {
                params.set("sort", sort);
            }

            if (query) {
                params.set("query", query);
            }

            return `${req.baseUrl}?${params.toString()}`;
        };

        res.json({
            status: "success",
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage
                ? createLink(result.prevPage)
                : null,
            nextLink: result.hasNextPage
                ? createLink(result.nextPage)
                : null,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            payload: [],
            message: error.message,
        });
    }
});

// Obtener un producto por ID
router.get("/:pid", async (req, res) => {
    try {
        const product = await productModel
            .findById(req.params.pid)
            .lean();

        if (!product) {
            return res.status(404).json({
                status: "error",
                message: "Producto no encontrado",
            });
        }

        res.json({
            status: "success",
            payload: product,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: "ID de producto inválido",
        });
    }
});

// Crear un producto
router.post("/", async (req, res) => {
    try {
        const newProduct = await productModel.create(req.body);

        res.status(201).json({
            status: "success",
            payload: newProduct,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
});

// Actualizar un producto
router.put("/:pid", async (req, res) => {
    try {
        const updatedProduct = await productModel.findByIdAndUpdate(
            req.params.pid,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                status: "error",
                message: "Producto no encontrado",
            });
        }

        res.json({
            status: "success",
            payload: updatedProduct,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
});

// Eliminar un producto
router.delete("/:pid", async (req, res) => {
    try {
        const deletedProduct = await productModel.findByIdAndDelete(
            req.params.pid
        );

        if (!deletedProduct) {
            return res.status(404).json({
                status: "error",
                message: "Producto no encontrado",
            });
        }

        res.json({
            status: "success",
            message: "Producto eliminado",
            payload: deletedProduct,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: "ID de producto inválido",
        });
    }
});

export default router;