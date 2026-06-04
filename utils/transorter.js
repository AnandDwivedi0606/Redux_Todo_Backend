const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((err) => {
    if (err) {
        console.error("SMTP Error:", err);
    } else {
        console.log("SMTP Ready");
    }
});

module.exports = { transporter }