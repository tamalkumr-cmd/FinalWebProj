import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // Gmail App Password
    },
});

export async function sendMail(to, subject, html) {
    await transporter.sendMail({
        from: `"Nors Services" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html, // 👈 IMPORTANT: use html, not text
    });
}