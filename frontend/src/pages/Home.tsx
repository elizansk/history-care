import '../resources/css/Home.css';
import NavigationBar from '../components/NavigationBar';

export default function Home() {
  return (
      <div className="home-page">
        <NavigationBar />
        <main className="container">
          <section className="about-section">
            <h2 className="service-title">О нашем фонде</h2>
            <p className="service-description">
              Мы занимаемся сохранением исторических зданий и культурного наследия России.
            </p>
          </section>
        </main>
      </div>

  );
}