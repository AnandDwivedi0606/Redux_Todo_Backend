const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const Authorization = async (req, res, next) => {
    try {
        const jwtToken = req.header("Authorization")

        if (!jwtToken) {
            return res.status(500).json({ message: "Unauthorizes Token !! Token Not Provided" })
        }

        const token = jwtToken.replace("Bearer", " ").trim()

        if (!token) {
            return res.status(500).json({ message: "Unauthorizes Token" })
        }

        const isVerified = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(isVerified.id)

        if (!user) {
            return res.status(500).json({ message: "User not Found" })
        }

        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token! Please log in again." })
    }
}

module.exports = Authorization