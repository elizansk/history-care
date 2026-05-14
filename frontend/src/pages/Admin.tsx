import {useEffect, useState} from "react";
import axios from "axios";
import NavigationBar from "../components/NavigationBar.tsx";
import Footer from "../components/Footer.tsx";

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    roleId: number;
    Role: Role;
}

export default function Admin() {
    const [me, setMe] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        // профиль админа
        axios.get(`/api/profile`, {
            headers: {Authorization: `Bearer ${token}`}
        })
            .then(res => {
                setMe(res.data)
            })
            .catch(console.error);

        // список всех пользователей
        axios.get(`/api/users`, {
            headers: {Authorization: `Bearer ${token}`}
        })
            .then(res => {
                console.log(res.data);
                setUsers(res.data);
            })
            .catch(console.error);

    }, []);

    if (!me) return <p style={{textAlign: "center", marginTop: 100}}>Loading...</p>;

    return (
        <>
            <NavigationBar/>
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
                    <p>Роль: {me.Role?.name}</p>
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
                                <div style={{fontSize: 14, color: "var(--text-muted)"}}>
                                    {user.email}
                                </div>

                                <div style={{
                                    marginTop: 10,
                                    display: "inline-block",
                                    padding: "6px 12px",
                                    borderRadius: "12px",
                                    background:
                                        user.Role?.name === "Admin"
                                            ? "#ffdddd"
                                            : user.Role?.name === "City"
                                                ? "#e6f2ec"
                                                : "#f4f4f4",
                                    fontSize: 12,
                                    fontWeight: 600
                                }}>
                                    {user.Role?.name}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer/>
        </>
    );
}