import React, { useState, useEffect } from 'react';
import App from './App.js'

function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch("https://prioritytasks.onrender.com/api/tasks")
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error("Error:", err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Мій Список Завдань ✅</h1>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;