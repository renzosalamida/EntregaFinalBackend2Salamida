import "dotenv/config";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import {
    Strategy as JwtStrategy,
    ExtractJwt,
} from "passport-jwt";

import userModel from "../models/user.model.js";
import cartModel from "../models/cart.model.js";
import { createHash, isValidPassword } from "../utils/utils.js";

const cookieExtractor = (req) => {
    if (req?.cookies?.coderCookieToken) {
        return req.cookies.coderCookieToken;
    }

    return null;
};

export const initializePassport = () => {
    // Estrategia de registro
    passport.use(
        "register",
        new LocalStrategy(
            {
                usernameField: "email",
                passReqToCallback: true,
            },
            async (req, email, password, done) => {
                try {
                    const { first_name, last_name, age } = req.body;

                    if (
                        !first_name ||
                        !last_name ||
                        age === undefined ||
                        !email ||
                        !password
                    ) {
                        return done(null, false, {
                            message: "Todos los campos son obligatorios",
                        });
                    }

                    const existingUser = await userModel.findOne({
                        email: email.toLowerCase(),
                    });

                    if (existingUser) {
                        return done(null, false, {
                            message: "El email ya está registrado",
                        });
                    }

                    const cart = await cartModel.create({
                        products: [],
                    });

                    const newUser = await userModel.create({
                        first_name,
                        last_name,
                        email: email.toLowerCase(),
                        age,
                        password: createHash(password),
                        cart: cart._id,
                        role: "user",
                    });

                    return done(null, newUser);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    // Estrategia de login
    passport.use(
        "login",
        new LocalStrategy(
            {
                usernameField: "email",
            },
            async (email, password, done) => {
                try {
                    const user = await userModel.findOne({
                        email: email.toLowerCase(),
                    });

                    if (!user) {
                        return done(null, false, {
                            message: "Email o contraseña incorrectos",
                        });
                    }

                    if (!isValidPassword(user, password)) {
                        return done(null, false, {
                            message: "Email o contraseña incorrectos",
                        });
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    // Estrategia para validar el JWT
    passport.use(
        "current",
        new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([
                    cookieExtractor,
                    ExtractJwt.fromAuthHeaderAsBearerToken(),
                ]),
                secretOrKey: process.env.JWT_SECRET,
            },
            async (jwtPayload, done) => {
                try {
                    const user = await userModel
                        .findById(jwtPayload.id)
                        .select("-password")
                        .populate("cart");

                    if (!user) {
                        return done(null, false, {
                            message: "Usuario no encontrado",
                        });
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );
};