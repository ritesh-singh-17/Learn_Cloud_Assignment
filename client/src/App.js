// src/App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState(
    {
      title: '', // String
      link: '', // String
      todos: [ // Array of objects
        {
          text: '', // String
          checked: false, // Boolean
          order: 0, // Number
        },
        // Additional todo objects if needed
      ],
    }
  );

  useEffect(() => {
    // Fetch todos from the server on component mount
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/todos');
      console.log(response.data);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/todos', {
        title: newTodo.title,
        order: todos.length, // Set the order to the next available index
        checked: false, // Set default checked state to false
      });

      console.log(response.data); // Log the response from the server
      fetchTodos();
      setNewTodo({ title: '', link: '', todos: [] }); // Reset the newTodo state
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };



  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Assuming todos have _id property
    const draggedTodo = todos[source.index];
    const updatedTodos = [...todos];
    updatedTodos.splice(source.index, 1);
    updatedTodos.splice(destination.index, 0, draggedTodo);

    setTodos(updatedTodos);

    console.log(source.index + " " + destination.index);
    // Update the backend with the new order
    try {
      await axios.put(`http://localhost:5000/api/todos/${draggedTodo._id}`, {
        order: destination.index,
      });
      console.log("Drag change saved successfully");
    } catch (error) {
      console.error('Error updating todo order:', error);
    }
  };




  const toggleCheck = async (todoIndex) => {
    // Toggle the checked state of a todo and update the backend
    const updatedTodos = [...todos];
    updatedTodos[todoIndex] = {
      ...updatedTodos[todoIndex],
      checked: !updatedTodos[todoIndex].checked,
    };

    setTodos(updatedTodos);

    try {
      await axios.put(`http://localhost:5000/api/todos/${updatedTodos[todoIndex]._id}`, {
        checked: updatedTodos[todoIndex].checked,
      });
    } catch (error) {
      console.error('Error updating todo checked state:', error);
    }
  };


  return (
    <div className='main-div'>
      <div className='add-todo-form'>
        <div className='form-div'>
          <h1>Checklist Dashboard</h1>
          <div className=' d-flex flex-column'>
            <label><b>Title: </b></label>
            <input
              type="text"
              value={newTodo.title}
              placeholder='Enter the item to add in todo list'
              onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
            />
          </div>
          <div>
          </div>
          <button onClick={addTodo}>Add Item</button>
        </div>
        {todos.length>0 && <h5>Following are the list of items.</h5>}
        <DragDropContext onDragEnd={handleDragEnd}>
          {todos.length > 0 && (
            <Droppable droppableId="todos">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef}>
                  {todos.map((todo, index) => (
                    <Draggable key={todo._id} draggableId={todo._id} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <input
                            type="checkbox"
                            checked={todo.checked}
                            onChange={() => toggleCheck(index)}
                          />
                          <span style={{ textDecoration: todo.checked ? 'line-through' : 'none' }}>
                            {todo.title}
                          </span>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          )}
        </DragDropContext>

      </div>
    </div>
  );
};

export default App;
