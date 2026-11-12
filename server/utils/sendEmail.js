const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

module.exports = async (to, subject, html) => {

    try {

        await transporter.sendMail({
            from: `"RoamNest" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        return true;

    } catch (error) {

        console.error("Email sending failed:", error.message);

        return false;

    }

};