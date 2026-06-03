const { Schema, model } = require("mongoose");

const todoSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        require: true
    },
    priority: {
        type: String,
        require: true
    },
    dueDate: {
        type: Date,
        require: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    }
},
    { timestamps: true }
)

const Todo = model("Todo", todoSchema)

module.exports = Todo