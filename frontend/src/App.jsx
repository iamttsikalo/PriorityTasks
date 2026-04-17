import React, { useState, useEffect } from 'react';

const API_URL = 'https://твій-бекенд.onrender.com/api'; // ЗАМІНИ НА СВІЙ URL З RENDER

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Перемикач Логін/Реєстрація
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authData, setAuthData] = useState({ username: '', password: '', email: '' });

  // 1. Завантаження завдань (тільки якщо є токен)
  const fetchTasks = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) logout(); // Якщо токен протух
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error("Помилка завантаження:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  // 2. Логін та Реєстрація
  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/login' : '/register';
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      });
      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
      } else if (data.message || data.error) {
        alert(data.message || data.error);
        if (!isLogin && !data.error) setIsLogin(true); // Перекидаємо на логін після реєстрації
      }
    } catch (err) {
      alert("Помилка зв'язку з сервером");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setTasks([]);
  };

  // 3. Додавання завдання
  const addTask = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title })
    });
    if (response.ok) {
      setTitle('');
      fetchTasks();
    }
  };

  // --- ІНТЕРФЕЙС ---

  if (!token) {
    return (
      <div className="auth-container">
        <h2>{isLogin ? 'Вхід' : 'Реєстрація'}</h2>
        <form onSubmit={handleAuth}>
          <input 
            placeholder="Username" 
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
            placeholder="Password" 
            onChange={e => setAuthData({...authData, password: e.target.value})} 
            required 
          />
          <button type="submit">{isLogin ? 'Увійти' : 'Створити аккаунт'}</button>
        </form>
        <p onClick={() => setIsLogin(!isLogin)} style={{cursor: 'pointer', color: 'blue'}}>
          {isLogin ? 'Немає аккаунту? Зареєструйся' : 'Вже є аккаунт? Увійди'}
        </p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <h1>Мої пріоритетні завдання</h1>
        <button onClick={logout}>Вийти</button>
      </header>

      <form onSubmit={addTask}>
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
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;