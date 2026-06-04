const Todo = require("../models/Todo.model");

const createNewTodo = async (req, res) => {    
    try {
        const { title, dueDate, priority } = req.body
        const userId = req?.user?._id;

        if (!title || !dueDate || !priority) {
            return res.status(400).json({ success: true, message: "All fields are required." })
        }

        const newTodo = new Todo({
            userId,
            title,
            dueDate,
            priority
        })

        await newTodo.save()

        res.status(200).json({ success: true, message: "Todo Created Successfully", newTodo })

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

const getAllTodo = async (req, res) => {
    try {
        const userId = req?.user?._id
        const todos = await Todo.find({ userId })

        res.status(200).json({ success: true, todos })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

const handleToogle = async (req, res) => {
    try {
        const { todoId } = req.params
        const todo = await Todo.findById(todoId)

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: "Todo not found"
            });
        }

        todo.completed = !todo.completed

        if (todo.completed) {
            todo.completedAt = Date.now()
        } else {
            todo.completedAt = null
        }

        await todo.save()
        return res.status(200).json({ success: true, todoId: todo._id, completed: todo.completed })

    } catch (error) {
        return res.status(500).json({ success: false, messsage: "Internal Server Error" })
    }
}

const handleDelete = async (req, res) => {
    try {
        const { todoId } = req.params

        const deleted = await Todo.findByIdAndDelete(todoId)

        if (!deleted) {
            return res.status(400).json({ success: false, message: "Todo not found" })
        }

        res.status(200).json({ success: true, todoId: deleted._id })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, messsage: "Internal Server Error" })
    }
}

const handleEdit = async (req, res) => {
    try {
        const { todoId } = req.params;
        const { newTitle } = req.body;

        const todo = await Todo.findByIdAndUpdate(todoId, { title: newTitle })

        if (!todo) {
            return res.status(400).json({ success: false, message: "Todo not Found" })
        }
        res.status(200).json({ success: true, newTitle, todoId: todo._id })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, messsage: "Internal Server Error" })
    }
}

const onClearComplete = async (req, res) => {
    try {
        const userId = req.user._id;

        const result = await Todo.deleteMany({ userId, completed: true, });

        const updatedTodos = await Todo.find({ userId }).sort({ createdAt: -1, });

        return res.status(200).json({ success: true, todos: updatedTodos });

    } catch (error) {
        // console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = { createNewTodo, getAllTodo, handleToogle, handleDelete, handleEdit, onClearComplete } 