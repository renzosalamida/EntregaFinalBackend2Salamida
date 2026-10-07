import "dotenv/config";
import jwt from "jsonwebtoken";

export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h",
        }
    );
};

export const generatePasswordResetToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            purpose: "password-reset",
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h",
        }
    );
};

export const verifyPasswordResetToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};