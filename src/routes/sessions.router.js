import { Router } from "express";
import passport from "passport";
import { generateToken } from "../utils/jwt.js";

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
        res.json({
            status: "success",
            payload: req.user,
        });
    }
);

export default router;