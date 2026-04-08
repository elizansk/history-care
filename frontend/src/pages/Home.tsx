import { useState } from "react";
import '../resources/css/Home.css';

interface User {
  id: number;
  name: string;
  role: "User" | "City" | "Admin";
}

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function Home() {

  const FRONT_URL = import.meta.env.VITE_FRONT_URL;
  const API_FRONT_URL = import.meta.env.VITE_API_FRONT_URL;
  function goToProfile() {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const payload = parseJwt(token);

    if (!payload?.role) {
      window.location.href = "/login";
      return;
    }

    const role = payload.role;

    if (role === "Admin") {
      window.location.href = "/admin";
    } else if (role === "City") {
      window.location.href = "/create-order";
    } else {
      window.location.href = "/profile";
    }
  }

  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = parseJwt(token);
    if (!payload) return null;

    return {
      id: payload.user_id,
      name: "Пользователь",
      role: payload.role.charAt(0).toUpperCase() + payload.role.slice(1),
    };
  });

  return (
      <div className="home-page">
        <header>
          <div className="header-container">
            <div className="header-left">
              <a href="/">Фонд реконструкции исторических зданий</a>
            </div>

            <div className="header-right">

              {!user ? (
                  <>
                    <a href="/login">Войти</a>
                    <a href="/register">Регистрация</a>
                  </>
              ) : (
                  <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        localStorage.removeItem("token");
                        setUser(null);
                      }}
                  >
                    Выйти
                  </a>
              )}

              <a href="#" onClick={(e) => { e.preventDefault(); goToProfile(); }}>
                Личный кабинет
              </a>

              <a href={`${API_FRONT_URL}/buildings`} className="reconstruction-btn">
                Исторические здания
              </a>

              <a href="/about">О нас</a>

              {(user?.role === "City" || user?.role === "Admin") && (
                  <a
                      href={`${FRONT_URL}/buildings`}
                      className="reconstruction-btn"
                  >
                    Создать заявку
                  </a>
              )}

            </div>
          </div>
        </header>

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