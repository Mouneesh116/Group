import nodemailer from 'nodemailer';
export const sendMail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: text
        };
        const send = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", send.response);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
}