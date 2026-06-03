const express = require("express")
const todoRoutes = express.Router()
const Authorization = require("../middleware/authMiddleware")
const { createNewTodo, getAllTodo, handleToogle, handleDelete, handleEdit, onClearComplete } = require("../controllers/todo.controller")

todoRoutes.post("/createNewTodo", Authorization, createNewTodo)
todoRoutes.get("/getAllTodo", Authorization, getAllTodo)
todoRoutes.patch("/toogle/:todoId", Authorization, handleToogle)
todoRoutes.delete("/delete/:todoId", Authorization, handleDelete)
todoRoutes.patch("/edit/:todoId", Authorization, handleEdit)
todoRoutes.patch("/clearComplete", Authorization, onClearComplete)

module.exports = todoRoutes



