const jwt = require("jsonwebtoken")

const generateTokenForResetPassword = (userId) => {
    const secret = process.env.JWT_SECRET
    const expiry = process.env.JWT_RESET_EXPIRES_IN
    return jwt.sign({
        id: userId
    }, secret, {
        expiresIn: expiry
    })
}

module.exports = generateTokenForResetPassword