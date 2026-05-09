import React from 'react';
import { Link } from 'react-router-dom';

const NavigationBar: React.FC = () => {
  return (
    <header className="main-header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/buildings">Фонд реконструкции исторических зданий</Link>
        </div>
        <div className="header-right">
          <Link to="/buildings">Заявки на реконструкцию</Link>
          <Link to="/profile">Личный кабинет</Link>
        </div>
      </div>
    </header>
  );
};

export default NavigationBar;