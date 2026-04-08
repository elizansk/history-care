import { useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}


export default function UserPage() {
        const API_URL = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get((`${API_URL}/profile`), { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {setUser(res.data); console.log(res.data);})
  }, []);

  if (!user) return <p style={{ textAlign: "center", marginTop: 100 }}>Loading...</p>;

  return (
    <div className="container">
      <h2 className="search-title">Профиль пользователя</h2>

      <div className="card" style={{ maxWidth: 500, margin: "0 auto 40px", padding: 20 }}>
        <h3 className="card-title">{user.name}</h3>
        <p>Email: {user.email}</p>
        <p>Роль: {user.role}</p>
      </div>
    </div>
  );
}