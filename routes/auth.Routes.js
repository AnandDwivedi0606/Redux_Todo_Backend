const express = require("express")
const authRoutes = express.Router()
const { registerUser, loginUser, getuserData, forgetPassword, resetPassword, changeName,changePassword } = require("../controllers/auth.controller")
const Authorization = require("../middleware/authMiddleware")

authRoutes.post("/register", registerUser)
authRoutes.post("/login", loginUser)
authRoutes.get("/getData", Authorization, getuserData)
authRoutes.post("/forgetPassword", forgetPassword)
authRoutes.post("/reset-password", resetPassword)
authRoutes.patch("/change-name", Authorization, changeName)
authRoutes.patch("/change-password", Authorization, changePassword)

module.exports = authRoutes