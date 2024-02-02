import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  // State variables for managing tasks and input values
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [sortType, setSortType] = useState(null);
  const [nextId, setNextId] = useState(1);

  // Ref for focusing on input elements
  const inputRef = useRef(null);

  // Effect to focus on input when the component mounts
  useEffect(() => {
    inputRef.current.focus();
    try {
      // Load tasks from local storage on mount
      const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
      setTasks(storedTasks);
      const maxId = storedTasks.reduce((max, task) => Math.max(max, task.id), 0);
      setNextId(maxId + 1);
    } catch (error) {
      console.error('Error loading tasks from local storage:', error);
      setTasks([]);
      setNextId(1);
    }
  }, []);

  // Effect to focus on input when editTaskId changes
  useEffect(() => {
    if (editTaskId !== null) {
      inputRef.current.focus();
    }
  }, [editTaskId]);

  // Function to update local storage with tasks
  const updateLocalStorage = (updatedTasks) => {
    try {
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Error saving tasks to local storage:', error);
    }
  };

  // Function to add a new task
  const addTask = () => {
    if (taskInput.trim() !== '') {
      const updatedTasks = [
        ...tasks,
        { id: nextId, text: taskInput, completed: false },
      ];
      setTasks(updatedTasks);
      setTaskInput('');
      setNextId((prevId) => prevId + 1);
      updateLocalStorage(updatedTasks);
    }
  };

  // Function to toggle the completion status of a task
  const toggleTask = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    updateLocalStorage(updatedTasks);
  };

  // Function to delete a task
  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    updateLocalStorage(updatedTasks);
  };

  // Function to initiate editing of a task
  const startEditing = (taskId, taskText) => {
    setEditTaskId(taskId);
    setEditTaskText(taskText);
  };

  // Function to save the edited task
  const saveEdit = () => {
    const updatedTasks = tasks.map((task) =>
      task.id === editTaskId ? { ...task, text: editTaskText } : task
    );
    setTasks(updatedTasks);
    setEditTaskId(null);
    setEditTaskText('');
    updateLocalStorage(updatedTasks);
  };

  // Function to cancel editing
  const cancelEdit = () => {
    setEditTaskId(null);
    setEditTaskText('');
  };

  // Function to handle input change during editing
  const handleEditInputChange = (e) => {
    setEditTaskText(e.target.value);
  };

  // Function to handle key press during editing
  const handleEditInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    }
  };

  // Function to sort tasks based on completion status
  const sortTasks = (type) => {
    const sortedTasks = [...tasks].sort((a, b) => {
      if (type === 'completed') {
        return a.completed === b.completed ? a.id - b.id : a.completed ? 1 : -1;
      } else if (type === 'uncompleted') {
        return a.completed === b.completed ? a.id - b.id : a.completed ? -1 : 1;
      } else {
        return a.id - b.id;
      }
    });
    setTasks(sortedTasks);
    setSortType(type);
    updateLocalStorage(sortedTasks);
  };

  // Function to clear sorting and reset to original order
  const clearSort = () => {
    setSortType(null);
    sortTasks(null);
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    addTask();
  };

  // Render the Todo App UI
  return (
    <div className="app">
      <header>
        <h1>Todo App</h1>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <div className="task-input">
            {/* Input for adding new tasks */}
            <input
              type="text"
              placeholder="Add a new task..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              ref={inputRef}
            />
            {/* Button to submit new task */}
            <button className="submit" type="submit">
              Add
            </button>
          </div>
        </form>
        {tasks.length > 0 && (
          <div className="sort-buttons">
            {/* Buttons for sorting tasks */}
            <button onClick={() => sortTasks('uncompleted')}>
              <span className="sort-text">Sort</span> Completed
            </button>
            <button onClick={() => sortTasks('completed')}>
              <span className="sort-text">Sort</span> Uncompleted
            </button>
            <button onClick={clearSort}>
              Clear <span className="sort-text">Sort</span>
            </button>
          </div>
        )}
        {tasks.length > 0 && (
          <ul className="task-list">
            {/* List of tasks */}
            {tasks.map((task) => (
              <li key={task.id} className={task.completed ? 'completed' : ''}>
                {editTaskId === task.id ? (
                  // Editing mode UI
                  <>
                    <input
                      type="text"
                      value={editTaskText}
                      onChange={handleEditInputChange}
                      onKeyPress={handleEditInputKeyPress}
                      ref={inputRef}
                    />
                    <button onClick={saveEdit}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  // View mode UI
                  <>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span>{task.text}</span>
                    <button onClick={() => startEditing(task.id, task.text)}>Edit</button>
                    <button onClick={() => deleteTask(task.id)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default App;
