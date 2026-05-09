import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="page-footer">
          <div className="footer-column">
            <p><strong>БЛАГОТВОРИТЕЛЬНЫЙ ФОНД</strong><br />
              СБЕРЕЖЕНИЯ КУЛЬТУРНЫХ И ДУХОВНЫХ ЦЕННОСТЕЙ «НАСЛЕДИЕ НАЦИИ»</p>
            <p>РАСЧЕТНЫЙ СЧЕТ 40 703 810 467 100 000 256<br />
              В ЗАПАДНО-СИБИРСКОМ БАНКЕ ПАО СБЕРБАНК Г. ТЮМЕНЬ</p>
          </div>
          <div className="footer-column">
            <p>ФАКТИЧЕСКИЙ АДРЕС: 101000, Г.МОСКВА, УЛ. МЯСНИЦКАЯ 47, ОФИС 532<br />
              ИРИНА ЛЕПИХИНА, ПРЕЗИДЕНТ<br />
              КОР/СЧЕТ 30 101 810 800 000 000 000<br />
              БИК 047 102 651<br />
              ОГРН 1 187 232 029 181<br />
              ИНН/КПП 7 203 463 423/720301001</p>
          </div>
          <div className="footer-column">
            <p>ЮРИДИЧЕСКИЙ АДРЕС: 625049, Г. ТЮМЕНЬ, УЛ. ТИМИРЯЗЕВА, 125<br />
              ТЕЛ. +79851929014, E-MAIL: NASLEDIE@NATCII.RU</p>
            <p>
              <a href="#">ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ</a> | 
              <a href="#">ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ</a> | 
              <a href="#">ДОГОВОР ОФЕРТЫ</a> | 
              <a href="#">О НАС</a> | 
              <a href="#">ОТЧЁТЫ</a>
            </p>
          </div>
        </footer>
  );
};

export default Footer;