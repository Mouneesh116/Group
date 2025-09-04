// utils/MailSender.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",   // ✅ explicitly set host
  port: 465,                // ✅ 465 (SSL)
  secure: true,             // ✅ true for port 465
  auth: {
    user: process.env.EMAIL_USER,     // your full Gmail address
    pass: process.env.EMAIL_PASSWORD, // your Gmail App Password (16 chars)
  },
  // Optional: increase timeouts for slow networks
  connectionTimeout: 30_000,
  greetingTimeout: 20_000,
  socketTimeout: 30_000,
});

export const sendMail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: `"E-Commerce" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html, // optional
  };

  // Enable debug logs while you’re diagnosing (remove later)
  // transporter.set("debug", true);

  const info = await transporter.sendMail(mailOptions);
  return info;
};
