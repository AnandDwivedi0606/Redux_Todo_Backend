const express = require("express")
const dotenv = require("dotenv")
dotenv.config()
const cors = require("cors")
const authRoutes = require("./routes/auth.Routes")
const connectDB = require("./db/db")
const todoRoutes = require("./routes/todo.Routes")

const app = express()

app.use(express.json())

const corsOption = {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOption))

app.get("/", (req, res) => {
    res.send("API is running....")
})

app.use("/api/auth",authRoutes)
app.use("/api/todo",todoRoutes)

const PORT = process.env.PORT

app.listen(PORT, async () => {
    await connectDB()
    console.log(`Server is running on PORT: https://taskflow-api-48ck.onrender.com`)
    // console.log(`Server is running on PORT: http://localhost:${PORT}`)
})