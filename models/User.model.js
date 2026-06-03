const { Schema, model } = require("mongoose")

const userSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        unique: true,
        require: true
    },
    password: {
        type: String,
        require: true,
        select: false
    }
},
    { timestamps: true }
)

const User = model("User", userSchema)

module.exports = User