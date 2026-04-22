import React, { useState, useEffect } from 'react';
import './App.css'; // ПІДКЛЮЧАЄМО ТВОЇ СТИЛІ

const API_URL = 'https://prioritytasks.onrender.com';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [authData, setAuthData] = useState({ username: '', password: '', email: '' });

  const fetchTasks = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_URL}/api/tasks/${userId}`);
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error("Помилка завантаження:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/login' : '/register';
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authData.username,
          password: authData.password,
          email: authData.email
        })
      });
      const data = await response.json();
      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('userId', data.user_id);
          localStorage.setItem('username', data.username);
          setUserId(data.user_id);
          setUsername(data.username);
        } else {
          alert("Успішно! Увійдіть.");
          setIsLogin(true);
        }
      } else {
        alert(data.error || "Помилка");
      }
    } catch (err) {
      alert("Сервер недоступний");
    }
  };

  const logout = () => {
    localStorage.clear();
    setUserId(null);
    setUsername(null);
    setTasks([]);
  };

  const addTask = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, user_id: userId })
    });
    if (response.ok) {
      setTitle('');
      fetchTasks();
    }
  };

  const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setTasks(tasks.filter(task => task.id !== taskId));
    } else {
      alert("Не вдалося видалити завдання");
    }
  } catch (err) {
    console.error("Помилка при видаленні:", err);
  }
};

  // ЕКРАН ЛОГІНУ / РЕЄСТРАЦІЇ
  if (!userId) {
    return (
      <div className="auth-container">
        <h2>{isLogin ? 'Вхід' : 'Реєстрація'}</h2>
        <form onSubmit={handleAuth}>
          <input 
            placeholder="Логін" 
            onChange={e => setAuthData({...authData, username: e.target.value})} 
            required 
          />
          {!isLogin && (
            <input 
              placeholder="Email" 
              onChange={e => setAuthData({...authData, email: e.target.value})} 
              required 
            />
          )}
          <input 
            type="password" 
            placeholder="Пароль" 
            onChange={e => setAuthData({...authData, password: e.target.value})} 
            required 
          />
          <button type="submit">{isLogin ? 'Увійти' : 'Створити аккаунт'}</button>
        </form>
        <p className="switch-auth" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Немає аккаунту? Зареєструйся' : 'Вже є аккаунт? Увійди'}
        </p>
      </div>
    );
  }

  // ЕКРАН ЗАВДАНЬ
  return (
    <div className="app-container">
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1>Привіт, {username}!</h1>
        <button className="logout-btn" onClick={logout}>Вийти</button>
      </header>

      <form onSubmit={addTask} style={{marginTop: '20px'}}>
        <input 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="Що потрібно зробити?" 
          required 
        />
        <button type="submit">Додати</button>
      </form>

      <ul>
  {tasks.map(task => (
    <li key={task.id} className="task-item">
      <span>{task.title}</span>
      {/* Додаємо кнопку з іконкою або текстом */}
      <button 
        className="delete-btn" 
        onClick={() => deleteTask(task.id)}
      >
        ✕
      </button>
    </li>
  ))}
</ul>
    </div>
  );
}

export default App;