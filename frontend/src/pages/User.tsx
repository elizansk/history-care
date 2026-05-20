import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "../store";
import { setUser } from "../store/auth-slice";
import { getUserRoleName } from "../utils/auth";
import NavigationBar from '../components/NavigationBar';

export default function User() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const roleName = getUserRoleName(user);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.first_name || user.name || "");
    setLastName(user.last_name || "");
    setEmail(user.email || "");
  }, [user]);

  if (!user) return <p style={{ textAlign: "center", marginTop: 100 }}>Loading...</p>;

  const canCreateOrder = roleName === 'City' || roleName === 'Admin';

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);
    setSaving(true);

    const trimmedPassword = password.trim();
    if (trimmedPassword && trimmedPassword.length < 6) {
      setErrorMessage('Пароль должен содержать не менее 6 символов.');
      setSaving(false);
      return;
    }

    try {
      const payload: Record<string, string> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      };
      if (trimmedPassword) {
        payload.password = trimmedPassword;
      }

      await axios.put('/api/profile', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      dispatch(setUser({
        ...user,
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        role: roleName,
      }));

      setPassword("");
      setStatusMessage('Профиль успешно обновлён.');
    } catch (error) {
      console.error('Profile update failed', error);
      const serverError = axios.isAxiosError<{ error?: string }>(error)
        ? error.response?.data?.error || 'Не удалось сохранить изменения. Проверьте данные и попробуйте снова.'
        : 'Не удалось сохранить изменения. Проверьте данные и попробуйте снова.';
      setErrorMessage(serverError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <NavigationBar />
      <div className="container">
        <h2 className="search-title">Профиль пользователя</h2>

        <div className="card" style={{ maxWidth: 560, margin: "0 auto 24px", padding: 24 }}>
          <h3 className="card-title">{user.first_name || user.name} {user.last_name || ''}</h3>
          <p>Email: {user.email}</p>
          <p>Роль: {roleName}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {canCreateOrder ? (
              <Link
                to="/create-order"
                style={{ display: 'inline-block', padding: '12px 18px', background: '#0e5a3c', color: '#fff', borderRadius: 12, textDecoration: 'none', textAlign: 'center' }}
              >
                Перейти к созданию заявки
              </Link>
            ) : (
              <div style={{ padding: '12px 18px', background: '#f5f5f5', color: '#4a4a4a', borderRadius: 12, textAlign: 'center' }}>
                Создание заявки доступно только для администратора и городского пользователя.
              </div>
            )}
            <Link
              to="/my-orders"
              style={{ display: 'inline-block', padding: '12px 18px', background: '#fff', color: '#0e5a3c', border: '1px solid #0e5a3c', borderRadius: 12, textDecoration: 'none', textAlign: 'center' }}
            >
              Просмотреть созданные заявки
            </Link>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 560, margin: "0 auto 40px", padding: 24 }}>
          <h3 className="card-title">Редактирование профиля</h3>
          <form onSubmit={handleSave} style={{ display: 'grid', gap: 16 }}>
            {statusMessage && <div style={{ color: '#0e5a3c' }}>{statusMessage}</div>}
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}

            <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              Имя
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              Фамилия
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              Новый пароль
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Оставьте пустым, чтобы не менять"
                style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: '12px 18px', background: '#0e5a3c', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer' }}
            >
              {saving ? 'Сохраняем...' : 'Сохранить изменения'}
            </button>
          </form>
        </div>

        <p style={{ maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
          Здесь вы можете обновить личные данные и задать новый пароль. Если пароль оставить пустым, текущий останется прежним.
        </p>
      </div>
    </div>
  );

}
