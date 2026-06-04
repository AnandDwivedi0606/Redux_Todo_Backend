// with port 587
// const nodemailer = require("nodemailer");
// const dns = require("dns");

// // Force IPv4 globally
// dns.setDefaultResultOrder("ipv4first");

// console.log("EMAIL_ID:", process.env.EMAIL_ID);
// console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false, // STARTTLS on port 587
//     requireTLS: true,

//     auth: {
//         user: process.env.EMAIL_ID,
//         pass: process.env.EMAIL_PASS,
//     },

//     family: 4, // Force IPv4

//     connectionTimeout: 60000,
//     greetingTimeout: 60000,
//     socketTimeout: 60000,

//     tls: {
//         rejectUnauthorized: false,
//         servername: "smtp.gmail.com",
//     },

//     logger: true,
//     debug: true,
// });

// // Verify SMTP connection
// (async () => {
//     try {
//         const success = await transporter.verify();
//         console.log("✅ SMTP Ready", success);
//     } catch (error) {
//         console.error("❌ SMTP Error");
//         console.error(error);
//     }
// })();

// module.exports = { transporter };











// with port 465
const nodemailer = require("nodemailer");
const dns = require("dns");

// Force IPv4
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // MUST be true for 465

    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS,
    },

    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 60000,

    family: 4,

    tls: {
        servername: "smtp.gmail.com",
        rejectUnauthorized: false,
    },

    logger: true,
    debug: true,
});

(async () => {
    try {
        await transporter.verify();
        console.log("✅ SMTP Ready");
    } catch (error) {
        console.error("❌ SMTP Error:", error);
    }
})();

module.exports = { transporter };