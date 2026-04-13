import { useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function Admin() {
  const [me, setMe] = useState<User | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // профиль админа
    axios.get(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => {console.log(res); setMe(res.data)})
        .catch(console.error);

    // список всех пользователей
    axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => {setUsers(res.data); console.log(res.data); })
        .catch(console.error);

  }, []);

  if (!me) return <p style={{ textAlign: "center", marginTop: 100 }}>Loading...</p>;

  return (
      <div className="container">
        <h2 className="search-title">Админ панель</h2>

        {/* Профиль */}
        <div className="card" style={{
          maxWidth: 500,
          margin: "0 auto 40px",
          padding: 20
        }}>
          <h3 className="card-title">{me.name}</h3>
          <p>Email: {me.email}</p>
          <p>Роль: {me.role}</p>
        </div>

        {/* Пользователи */}
        <h3 style={{
          marginBottom: 20,
          color: "var(--primary)",
          textAlign: "center"
        }}>
          Все пользователи
        </h3>

        <div className="grid">
          {users.map(user => (
              <div key={user.id} className="card">
                <div className="card-content">
                  <div className="card-title">{user.name}</div>
                  <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
                    {user.email}
                  </div>

                  <div style={{
                    marginTop: 10,
                    display: "inline-block",
                    padding: "6px 12px",
                    borderRadius: "12px",
                    background:
                        user.role === "Admin"
                            ? "#ffdddd"
                            : user.role === "City"
                                ? "#e6f2ec"
                                : "#f4f4f4",
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {user.role}
                  </div>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
}