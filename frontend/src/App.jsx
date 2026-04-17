import React, { useState, useEffect } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // URL твого бекенду на Render
  const API_URL = "https://prioritytasks.onrender.com/api/tasks";

  // Функція завантаження даних
  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error("Помилка завантаження:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Функція додавання завдання
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle })
      });

      if (response.ok) {
        setNewTaskTitle(""); // Очистити поле
        fetchTasks();        // Оновити список
      }
    } catch (err) {
      console.error("Помилка додавання:", err);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Мій Список Завдань ✅</h1>
      
      <form onSubmit={handleAddTask} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input 
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Що потрібно зробити?"
          style={{ padding: '10px', flex: 1, borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>
          Додати
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map(task => (
          <li key={task.id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
            <span>{task.title}</span>
            <small style={{ color: '#888' }}>ID: {task.id}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;