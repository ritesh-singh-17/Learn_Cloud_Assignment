require('dotenv').config();


const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const db = process.env.MONGO_URL;
mongoose.connect(db).then(() => {
  console.log("connection to mongodb is successfull")
}).catch((e) => {
  console.log("connection not successfull");
});

// Define MongoDB schema and model for Todos
const todoSchema = new mongoose.Schema({
  title: String,
  order: Number,
  checked: Boolean,
});

const Todo = mongoose.model('Todo', todoSchema);

// Express routes
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ order: 1 });
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/todos', async (req, res) => {
  const newTodo = new Todo(req.body);
  await newTodo.save();
  res.send('Todo added successfully!');
});


// console.log('Todo updated successfully!');
// // console.log(updatedTodo);

app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { order } = req.body;
  const { checked } = req.body;
  console.log(checked);

  try {
    if (order) {
      const updatedTodo = await Todo.findByIdAndUpdate(
        id,
        { $set: { order: order } },
      );
    } else {
      const updatedTodo = await Todo.findByIdAndUpdate(
        id,
        { $set: { checked: checked } },
        { new: true }
      );
    }

    res.status(200).send('Todo updated successfully!');
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});