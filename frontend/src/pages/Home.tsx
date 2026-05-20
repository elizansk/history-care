import { Link } from 'react-router-dom';
import '../resources/css/Home.css';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';

const impactStats = [
  { value: '24', label: 'исторических объекта в работе' },
  { value: '11', label: 'городов участвуют в сохранении наследия' },
  { value: '3,8 млн ₽', label: 'уже направлено на реконструкцию' },
];

const directions = [
  {
    title: 'Реставрация зданий',
    text: 'Помогаем собирать средства на укрепление конструкций, ремонт фасадов, кровель и исторических деталей.',
  },
  {
    title: 'Документы и сметы',
    text: 'Заявки содержат перечень работ, сумму сбора, описание объекта и материалы, чтобы доноры видели прозрачную цель.',
  },
  {
    title: 'Городские инициативы',
    text: 'Администрации и ответственные организации могут формировать заявки и отслеживать их статусы в личном кабинете.',
  },
];

const steps = [
  'Город или администратор создаёт заявку на восстановление объекта.',
  'Команда проверяет описание, услуги и стоимость работ.',
  'После публикации пользователи выбирают объект и делают пожертвование.',
  'Статус заявки обновляется, а собранные средства отображаются на странице объекта.',
];

export default function Home() {
  return (
    <div className="home-page">
      <NavigationBar />

      <main>
        <section className="home-hero">
          <img src="/norilsk.jpg" alt="Историческое деревянное здание" className="home-hero-image" />
          <div className="home-hero-overlay" />
          <div className="home-hero-content">
            <p className="home-kicker">Фонд реконструкции исторических зданий</p>
            <h1>Наследие Нации</h1>
            <p className="home-hero-text">
              Платформа для сохранения архитектурной памяти: здесь города публикуют заявки на восстановление,
              а неравнодушные люди помогают объектам дождаться ремонта.
            </p>
            <div className="home-hero-actions">
              <Link to="/buildings" className="btn btn-success btn-lg">
                Смотреть заявки
              </Link>
              <Link to="/donate" className="btn btn-light btn-lg">
                Сделать пожертвование
              </Link>
            </div>
          </div>
        </section>

        <section className="home-stats" aria-label="Показатели фонда">
          {impactStats.map((stat) => (
            <div className="home-stat" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        <section className="home-section home-intro">
          <div>
            <p className="home-section-label">Зачем это нужно</p>
            <h2>Историческое здание исчезает не за один день</h2>
          </div>
          <p>
            Сначала откладывается ремонт, затем закрываются помещения, потом теряются детали, по которым место
            узнавали жители. Мы собираем заявки, суммы, фотографии и историю объектов в одном месте, чтобы помощь
            была понятной, своевременной и проверяемой.
          </p>
        </section>

        <section className="home-section">
          <div className="home-section-heading">
            <p className="home-section-label">Направления</p>
            <h2>Что можно поддержать</h2>
          </div>
          <div className="home-directions">
            {directions.map((item) => (
              <article className="home-direction-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-gallery-section">
          <div className="home-gallery-copy">
            <p className="home-section-label">Живая история</p>
            <h2>Мы сохраняем не только стены, но и ощущение места</h2>
            <p>
              Каждая заявка связана с конкретным зданием, адресом и набором работ. Фотографии помогают увидеть,
              что именно требует внимания: фасад, интерьер, деревянные конструкции, материалы или инженерные узлы.
            </p>
            <Link to="/buildings" className="btn btn-outline-success">
              Перейти к объектам
            </Link>
          </div>
          <div className="home-gallery">
            <img src="/norilsk1.jpg" alt="Интерьер исторического деревянного дома" />
            <img src="/norilsk2.jpg" alt="Фрагмент старинного интерьера" />
          </div>
        </section>

        <section className="home-section home-process">
          <div className="home-section-heading">
            <p className="home-section-label">Как всё устроено</p>
            <h2>Путь заявки от черновика до сбора</h2>
          </div>
          <div className="home-steps">
            {steps.map((step, index) => (
              <div className="home-step" key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="home-cta">
          <div>
            <p className="home-section-label">Присоединиться</p>
            <h2>Выберите объект, которому нужна помощь сегодня</h2>
            <p>
              Даже небольшой взнос приближает заявку к выполнению работ и помогает сохранить место,
              которое ещё может стать частью будущего города.
            </p>
          </div>
          <Link to="/buildings" className="btn btn-success btn-lg">
            Найти заявку
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
