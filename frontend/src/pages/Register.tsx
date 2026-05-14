
import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import '../styles/FormStyles.css';

interface RegisterForm {
  last_name: string;
  first_name: string;
  email: string;
  password: string;
  role_id: number;
  cityId?: number;
}


interface City {
  id: number;
  name: string;
}

export default function Register() {
    const [form, setForm] = useState<RegisterForm>({
    last_name: '',
    first_name: '',
    email: '',
    password: '',
    role_id: 3,
  });

  const [cities, setCities] = useState<City[]>([]);


  useEffect(() => {
    fetch(`/api/cities`)
      .then(res => res.json())//сервер вернул ответ - json в строку
      .then(data => setCities(data))//города в state
      .catch(err => console.error('Ошибка загрузки городов:', err));
  }, []);

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

    const response = await fetch(`/api/auth/register`, {//отправляем запрос на сервер
      method: 'POST',//создаём нового пользователя
      headers: {
        'Content-Type': 'application/json',//говорим серверу “я отправляю JSON”
      },
      body: JSON.stringify(payload),//превращаем JS объект в JSON строку
    });
    console.log(JSON.stringify(payload));

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

          <select name="roleId" value={form.role_id} onChange={handleChange}>
            <option value={3}>Пользователь</option>
            <option value={2}>Город</option>
          </select>
        </div>

        {form.role_id === 2 && (
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