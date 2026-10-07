import { Router } from "express";
import passport from "passport";

import {
    generateToken,
    generatePasswordResetToken,
    verifyPasswordResetToken,
} from "../utils/jwt.js";

import UserDTO from "../dto/user.dto.js";

import { userRepository } from "../repositories/index.js";

import {
    createHash,
    isValidPassword,
} from "../utils/utils.js";

import {
    sendPasswordResetEmail,
} from "../services/mail.service.js";

const router = Router();

// Registro
router.post("/register", (req, res, next) => {
    passport.authenticate(
        "register",
        { session: false },
        (error, user, info) => {
            if (error) {
                return next(error);
            }

            if (!user) {
                return res.status(400).json({
                    status: "error",
                    message: info?.message || "No se pudo registrar el usuario",
                });
            }

            const userResponse = user.toObject();
            delete userResponse.password;

            return res.status(201).json({
                status: "success",
                message: "Usuario registrado correctamente",
                payload: userResponse,
            });
        }
    )(req, res, next);
});

// Login
router.post("/login", (req, res, next) => {
    passport.authenticate(
        "login",
        { session: false },
        (error, user, info) => {
            if (error) {
                return next(error);
            }

            if (!user) {
                return res.status(401).json({
                    status: "error",
                    message: info?.message || "Credenciales incorrectas",
                });
            }

            const token = generateToken(user);

            res.cookie("coderCookieToken", token, {
                maxAge: 60 * 60 * 1000,
                httpOnly: true,
                sameSite: "lax",
            });

            return res.json({
                status: "success",
                message: "Login realizado correctamente",
                token,
            });
        }
    )(req, res, next);
});

// Usuario autenticado
router.get(
    "/current",
    passport.authenticate("current", {
        session: false,
    }),
    (req, res) => {
        const userDTO = new UserDTO(req.user);

        res.json({
            status: "success",
            payload: userDTO,
        });
    }
);

// Solicitar recuperación de contraseña
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: "error",
                message: "El email es obligatorio",
            });
        }

        const user = await userRepository.getUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "No existe un usuario con ese email",
            });
        }

        const resetToken = generatePasswordResetToken(user);

        await sendPasswordResetEmail(
            user.email,
            resetToken
        );

        res.json({
            status: "success",
            message:
                "Se envió un correo para restablecer la contraseña",
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

// Cambiar la contraseña
router.post("/reset-password", async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                status: "error",
                message:
                    "El token y la nueva contraseña son obligatorios",
            });
        }

        let decoded;

        try {
            decoded = verifyPasswordResetToken(token);
        } catch (error) {
            return res.status(400).json({
                status: "error",
                message:
                    "El enlace expiró o no es válido. Solicitá uno nuevo.",
            });
        }

        if (decoded.purpose !== "password-reset") {
            return res.status(400).json({
                status: "error",
                message:
                    "El token no es válido para recuperar la contraseña",
            });
        }

        const user =
            await userRepository.getUserByIdWithPassword(
                decoded.id
            );

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "Usuario no encontrado",
            });
        }

        if (isValidPassword(user, password)) {
            return res.status(400).json({
                status: "error",
                message:
                    "La nueva contraseña no puede ser igual a la anterior",
            });
        }

        await userRepository.updateUser(
            user._id,
            {
                password: createHash(password),
            }
        );

        res.json({
            status: "success",
            message:
                "Contraseña actualizada correctamente",
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

export default router;