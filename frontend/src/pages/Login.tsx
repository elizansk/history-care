import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { login } from '../store/auth-slice.ts';
import { getUserRoleName } from '../utils/auth';
import { isMockAuthAvailable, mockLogin } from '../mock/auth.mock';
import '../resources/css/Login.css';

interface LoginForm {
  email: string;
  password: string;
}

interface LoginUser {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string | { id?: number; name?: string };
  Role?: { id?: number; name?: string };
  city_id?: number;
}

interface LoginResponse {
  token?: string;
  user: LoginUser;
}

export default function Login() {

  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const authorize = (data: LoginResponse) => {
      if (!data.token) {
        throw new Error('Сервер не вернул токен');
      }

      localStorage.setItem("token", data.token);

      dispatch(login({
        user: {
          ...data.user,
          role: getUserRoleName(data.user),
        },
        token: data.token,
      }));

      console.log('Ответ сервера:', data);
      alert('Успешный вход!');

      navigate('/');
    };

    try {
      const response = await axios.post<LoginResponse>(`/api/auth/login`, form);
      authorize(response.data);
    } catch (error) {
      console.error('Ошибка:', error);

      if (isMockAuthAvailable) {
        try {
          authorize(mockLogin(form.email, form.password));
          return;
        } catch (mockError) {
          alert(mockError instanceof Error ? mockError.message : 'Ошибка mock-входа');
          return;
        }
      }

      const message = axios.isAxiosError<{ error?: string }>(error)
        ? error.response?.data?.error || 'Ошибка входа'
        : 'Ошибка при входе';
      alert(message);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Вход</h2>

        <div className="login-form-section">
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

        <button className="login-submit">Войти</button>

        <p className="login-link">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  );
}
