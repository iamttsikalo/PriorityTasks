import React, { useState, useEffect } from 'react';

const API_URL = 'https://prioritytasks.onrender.com';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [authData, setAuthData] = useState({ username: '', password: '', email: '' });

  // 1. Отримання завдань (тепер через /api/tasks/ID)
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

  // 2. Логін та Реєстрація (відповідно до твого app.py)
const handleAuth = async (e) => {
    e.preventDefault();
    // Ми чітко вказуємо шлях, як у твоєму Python коді
    const endpoint = isLogin ? '/login' : '/register';
    const url = `${API_URL}${endpoint}`;
    
    console.log("Відправляю запит на:", url); // Для перевірки в консолі

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authData.username,
          password: authData.password,
          email: authData.email // Бекенд вимагає email для реєстрації!
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
          alert("Реєстрація успішна! Тепер увійдіть під своїм логіном.");
          setIsLogin(true); // Автоматично перемикаємо на форму входу
        }
      } else {
        // Якщо бекенд повернув помилку (наприклад, юзер уже існує)
        alert(data.error || "Помилка авторизації");
      }
    } catch (err) {
      console.error("Критична помилка:", err);
      alert("Не вдалося з'єднатися з сервером. Перевірте інтернет або посилання на бекенд.");
    }
  };
  const logout = () => {
    localStorage.clear();
    setUserId(null);
    setUsername(null);
    setTasks([]);
  };

  // 3. Додавання завдання (передаємо user_id у тілі запиту)
  const addTask = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: title,
        user_id: userId // Важливо для твого бекенду
      })
    });
    if (response.ok) {
      setTitle('');
      fetchTasks();
    }
  };

  if (!userId) {
    return (
      <div className="auth-container" style={{padding: '20px', textAlign: 'center'}}>
        <h2>{isLogin ? 'Вхід' : 'Реєстрація'}</h2>
        <form onSubmit={handleAuth} style={{display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto'}}>
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
        <p onClick={() => setIsLogin(!isLogin)} style={{cursor: 'pointer', color: 'blue', marginTop: '10px'}}>
          {isLogin ? 'Немає аккаунту? Зареєструйся' : 'Вже є аккаунт? Увійди'}
        </p>
      </div>
    );
  }

  return (
    <div className="app-container" style={{padding: '20px'}}>
      <header style={{display: 'flex', justifyContent: 'space-between'}}>
        <h1>Привіт, {username}!</h1>
        <button onClick={logout}>Вийти</button>
      </header>

      <form onSubmit={addTask} style={{margin: '20px 0'}}>
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
          <li key={task.id} style={{padding: '10px', background: '#eee', margin: '5px 0', borderRadius: '5px', listStyle: 'none'}}>
            {task.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;