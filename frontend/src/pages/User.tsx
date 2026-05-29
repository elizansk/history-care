import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "../store";
import { setUser } from "../store/auth-slice";
import { getUserRoleName } from "../utils/auth";
import { isMockAuthAvailable } from "../mock/auth.mock";
import NavigationBar from '../components/NavigationBar';
import '../resources/css/User.css';

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

  if (!user) return <p className="user-loading">Loading...</p>;

  const canCreateOrder = roleName === 'City' || roleName === 'Admin';
  const canViewCreatedOrders = roleName === 'City' || roleName === 'Admin';

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

    const payload: Record<string, string> = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
    };
    if (trimmedPassword) {
      payload.password = trimmedPassword;
    }

    try {
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
      if (isMockAuthAvailable) {
        dispatch(setUser({
          ...user,
          first_name: payload.first_name,
          last_name: payload.last_name,
          email: payload.email,
          role: roleName,
        }));
        setPassword("");
        setStatusMessage('Профиль обновлён в mock-режиме.');
        return;
      }
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
      <div className="container user-page">
        <h2 className="search-title">Профиль пользователя</h2>

        <div className="card user-card">
          <h3 className="card-title">{user.first_name || user.name} {user.last_name || ''}</h3>
          <p>Email: {user.email}</p>
          <p>Роль: {roleName}</p>
          <div className="user-actions">
            {canCreateOrder && (
              <Link
                to="/create-order"
                className="user-action-primary"
              >
                Перейти к созданию заявки
              </Link>
            )}
            {canViewCreatedOrders && (
              <Link
                to="/my-orders"
                className="user-action-secondary"
              >
                Просмотреть созданные заявки
              </Link>
            )}
          </div>
        </div>

        <div className="card user-edit-card">
          <h3 className="card-title">Редактирование профиля</h3>
          <form onSubmit={handleSave} className="user-form">
            {statusMessage && <div className="user-message-success">{statusMessage}</div>}
            {errorMessage && <div className="user-message-error">{errorMessage}</div>}

            <label className="user-field">
              Имя
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </label>
            <label className="user-field">
              Фамилия
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </label>
            <label className="user-field">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="user-field">
              Новый пароль
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Оставьте пустым, чтобы не менять"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="user-submit"
            >
              {saving ? 'Сохраняем...' : 'Сохранить изменения'}
            </button>
          </form>
        </div>

        <p className="user-note">
          Здесь вы можете обновить личные данные и задать новый пароль. Если пароль оставить пустым, текущий останется прежним.
        </p>
      </div>
    </div>
  );

}
