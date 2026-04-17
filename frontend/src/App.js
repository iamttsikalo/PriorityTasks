import { useState, useEffect } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch("https://prioritytasks.onrender.com/api/tasks")
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error("Помилка завантаження:", err));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Мій Список Завдань ✅</h1>
      <ul>
        {tasks.map(task => (
          <li key={task.id} style={{ marginBottom: '10px' }}>
            <strong>{task.title}</strong> — {task.status}
          </li>
        ))}
      </ul>
      {tasks.length === 0 && <p>Завдань поки немає або сервер вантажиться...</p>}
    </div>
  );
}

export default App;