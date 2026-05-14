import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/auth-slice.ts';
import '../styles/FormStyles.css';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {

  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const dispatch = useDispatch();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      // Преобразуем ответ сразу в JSON
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Ошибка входа');
        return;
      }

      // Сохраняем JWT в localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // передаем login в Redux
      dispatch(login({ user: data.user, token: data.token }));

      console.log('Ответ сервера:', data);
      alert('Успешный вход!');

      window.location.href = '/';


    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при входе');
    }
  };

  return (
    <div className="form-container">
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Вход</h2>

        <div className="form-section">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button className="form-submit">Войти</button>

        <p className="form-link">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  );
}