const nodemailer = require("nodemailer");
const dns = require("dns");

// Force IPv4 first (helps on some cloud providers)
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // Use SSL port
    secure: true, // Must be true for port 465

    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS, // Gmail App Password
    },

    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 60000,

    tls: {
        rejectUnauthorized: false,
    },

    logger: true,
    debug: true,
});

// Verify SMTP connection
(async () => {
    try {
        await transporter.verify();
        console.log("✅ SMTP Ready");
    } catch (error) {
        console.error("❌ SMTP Error:", error);
    }
})();

module.exports = { transporter };