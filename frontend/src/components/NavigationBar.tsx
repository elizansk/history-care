import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/auth-slice.ts';

const NavigationBar: React.FC = () => {
  const { user, isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = async () => {

    await fetch(`/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
    });

    // Преобразуем ответ сразу в JSON
    dispatch(logout());
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/buildings">Фонд реконструкции исторических зданий</Link>
        </div>
        <div className="header-right">
          <Link to="/buildings">Исторические здания</Link>
          {isAuthenticated ? (//авториз
            <>
              <span className="header-user">Привет, {user?.first_name || user?.name || user?.email} {user?.last_name || ''}</span>
              <Link to= {user?.role !== 'Admin' ? '/profile' : '/admin'}>Личный кабинет</Link>
              <button className="header-logout" onClick={handleLogout}>Выход</button>
            </>
          ) : (//не авт
            <Link to="/login">Войти</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavigationBar;