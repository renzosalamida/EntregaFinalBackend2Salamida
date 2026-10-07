import { Router } from "express";
import passport from "passport";

import {
    userRepository,
    cartRepository,
} from "../repositories/index.js";

import { createHash } from "../utils/utils.js";
import { authorization } from "../middlewares/authorization.js";

const router = Router();

router.use(
    passport.authenticate("current", { session: false }),
    authorization("admin")
);

// CREATE: crear usuario
router.post("/", async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            age,
            password,
            role,
        } = req.body;

        if (!first_name || !last_name || !email || age === undefined || !password) {
            return res.status(400).json({
                status: "error",
                message: "Todos los campos son obligatorios",
            });
        }

        const existingUser = await userRepository.getUserByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                status: "error",
                message: "El email ya está registrado",
            });
        }

        const cart = await cartRepository.createCart({
            products: [],
        });

        const newUser = await userRepository.createUser({
            first_name,
            last_name,
            email: email.toLowerCase(),
            age,
            password: createHash(password),
            cart: cart._id,
            role: role || "user",
        });

        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            status: "success",
            payload: userResponse,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

// READ: obtener todos los usuarios
router.get("/", async (req, res) => {
    try {
        const users = await userRepository.getUsers();

        res.json({
            status: "success",
            payload: users,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

// READ: obtener un usuario por ID
router.get("/:uid", async (req, res) => {
    try {
        const user = await userRepository.getUserById(req.params.uid);

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "Usuario no encontrado",
            });
        }

        res.json({
            status: "success",
            payload: user,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: "ID de usuario inválido",
        });
    }
});

// UPDATE: actualizar usuario
router.put("/:uid", async (req, res) => {
    try {
        const updates = { ...req.body };

        if (updates.password) {
            updates.password = createHash(updates.password);
        }

        if (updates.email) {
            updates.email = updates.email.toLowerCase();
        }

        const updatedUser = await userRepository.updateUser(
            req.params.uid,
            updates
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: "error",
                message: "Usuario no encontrado",
            });
        }

        res.json({
            status: "success",
            payload: updatedUser,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
});

// DELETE: eliminar usuario
router.delete("/:uid", async (req, res) => {
    try {
        const deletedUser = await userRepository.deleteUser(req.params.uid);

        if (!deletedUser) {
            return res.status(404).json({
                status: "error",
                message: "Usuario no encontrado",
            });
        }

        res.json({
            status: "success",
            message: "Usuario eliminado correctamente",
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: "ID de usuario inválido",
        });
    }
});

export default router;