const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Mongo DB Database connected");
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectDB