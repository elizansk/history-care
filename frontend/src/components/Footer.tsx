import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="page-footer">
      <div className="footer-desktop">
        <div className="footer-column footer-brand">
          <p>
            <strong>БЛАГОТВОРИТЕЛЬНЫЙ ФОНД</strong>
            <br />
            СБЕРЕЖЕНИЯ КУЛЬТУРНЫХ И ДУХОВНЫХ ЦЕННОСТЕЙ «НАСЛЕДИЕ НАЦИИ»
          </p>
          <p>
            Поддерживаем восстановление исторических зданий, собираем сведения о памятниках
            архитектуры и помогаем делать сборы на реконструкцию прозрачными.
          </p>
        </div>
        <div className="footer-column">
          <h4>Контакты</h4>
          <p>
            Юридический адрес: 625049, г. Тюмень, ул. Тимирязева, 125
            <br />
            Фактический адрес: 101000, г. Москва, ул. Мясницкая, 47, офис 532
            <br />
            Телефон: +7 985 192-90-14
            <br />
            Email: nasledie@natcii.ru
          </p>
        </div>
        <div className="footer-column">
          <h4>Реквизиты</h4>
          <p>
            Счет: 42301810700087173134
            <br />
            Кор/счет: 30101810800000000000
            <br />
            БИК: 047102651
            <br />
            ОГРН: 1187232029181
            <br />
            ИНН/КПП: 7203463423 / 720301001
          </p>
        </div>
        <div className="footer-column footer-links">
          <h4>Разделы</h4>
          <p>
            <Link to="/buildings">Исторические здания</Link>
            <Link to="/register">Регистрация</Link>
          </p>
        </div>
      </div>

      <div className="footer-mobile">
        <p>
          <strong>БЛАГОТВОРИТЕЛЬНЫЙ ФОНД</strong>
          <br />
          СБЕРЕЖЕНИЯ КУЛЬТУРНЫХ И ДУХОВНЫХ ЦЕННОСТЕЙ «НАСЛЕДИЕ НАЦИИ»
        </p>
        <p>Счет: 42301810700087173134</p>
      </div>
    </footer>
  );
};

export default Footer;
