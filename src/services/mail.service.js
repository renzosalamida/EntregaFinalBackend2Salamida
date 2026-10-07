import transporter from "../config/mailer.js";

export const sendPasswordResetEmail = async (email, resetToken) => {
    const resetLink =
        `http://localhost:${process.env.PORT || 8080}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "Recuperación de contraseña",
        html: `
            <h2>Recuperación de contraseña</h2>

            <p>Recibimos una solicitud para cambiar tu contraseña.</p>

            <p>
                <a
                    href="${resetLink}"
                    style="
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #007bff;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                    "
                >
                    Restablecer contraseña
                </a>
            </p>

            <p>Este enlace vence en 1 hora.</p>

            <p>
                Si no solicitaste este cambio,
                podés ignorar este correo.
            </p>
        `,
    });
};