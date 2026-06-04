const nodemailer = require("nodemailer");

const brevoTransporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,

    auth: {
        user: process.env.BREVO_LOGIN,
        pass: process.env.BREVO_SMTP_KEY,
    },

    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 60000,

    logger: true,
    debug: true,
});

(async () => {
    try {
        await brevoTransporter.verify();
        console.log("✅ Brevo SMTP Ready");
    } catch (error) {
        console.error("❌ Brevo SMTP Error:", error);
    }
})();

module.exports = { brevoTransporter };