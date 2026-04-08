
import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import '../styles/FormStyles.css';

type Role = 'User' | 'City';

interface RegisterForm {
  last_name: string;
  first_name: string;
  email: string;
  password: string;
  role: Role;
  cityId?: number;
}


interface City {
  id: number;
  name: string;
}

export default function Register() {
    const API_URL = import.meta.env.VITE_API_URL;
    console.log(`${API_URL}/auth/cities`);
    const [form, setForm] = useState<RegisterForm>({
    last_name: '',
    first_name: '',
    email: '',
    password: '',
    role: 'User'
  });

  const [cities, setCities] = useState<City[]>([]);


  useEffect(() => {
    fetch(`${API_URL}/auth/cities`)
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(err => console.error('Ошибка загрузки городов:', err));
  }, []);
 console.log(cities);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === 'cityId' ? Number(value) : value
    });
  };

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  try {
    // подготовка payload
    const payload = {
      ...form,
      cityId: form.cityId || undefined, // если пусто — не отправляем
    };

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('Ответ сервера:', data);

    if (!response.ok) {
      alert('Ошибка регистрации');
      return;
    }
    if (data.token) {
        localStorage.setItem("token", data.token);
      }

    alert('Успешная регистрация!');

   window.location.href = '/';
  } catch (error) {
    console.error('Ошибка:', error);
  }
};

  return (
    <div className="form-container">
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Регистрация</h2>

        <div className="form-section">
          <input
            type="text"
            name="first_name"
            placeholder="Имя"
            value={form.first_name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="last_name"
            placeholder="Фамилия"
            value={form.last_name}
            onChange={handleChange}
            required
          />
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

          <select name="role" value={form.role} onChange={handleChange}>
            <option value="User">Пользователь (донат)</option>
            <option value="City">Город (заявки)</option>
          </select>
        </div>

        {form.role === 'City' && (
          <>
            <h3 className="city-title">Данные города</h3>
            <div className="form-section">
              <select
                name="cityId"
                value={form.cityId || ''}
                onChange={handleChange}
                required
              >
                <option value="">Выберите город</option>

                {cities.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <button className="form-submit">Зарегистрироваться</button>

        <p className="form-link">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  );
}