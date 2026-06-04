const { Schema, model } = require("mongoose");

const otpSchema = new Schema({
    email: {
        type: String,
        require: true
    },
    otp: {
        type: String,
        require: true
    },
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: 600
    }
},
    { timestamps: true }
)

const OTP = model("OTP", otpSchema)

module.exports = OTP