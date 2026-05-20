import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import NavigationBar from "../components/NavigationBar.tsx";
import Footer from "../components/Footer.tsx";
import { getUserRoleName } from "../utils/auth";

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    role?: string;
    roleId?: number;
    Role?: Role;
}

interface OrderUser {
    id?: number;
    name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
}

interface AdminOrder {
    id: number;
    building?: {
        name?: string;
        address?: string;
    };
    creator?: OrderUser;
    creator_id?: number;
    status: string;
    total_amount?: number;
    collected_amount?: number;
    created_at?: string;
    completed_at?: string | null;
}

const POLLING_INTERVAL_MS = 5000;

const statusTranslations: Record<string, string> = {
    draft: "Черновик",
    formed: "Сформирована",
    collection_started: "Сбор начат",
    finished: "Завершена",
    rejected: "Отклонена",
    reject: "Отклонена",
    deleted: "Удалена",
};

const statusOptions = [
    { value: "", label: "Все статусы" },
    { value: "draft", label: "Черновик" },
    { value: "formed", label: "Сформирована" },
    { value: "collection_started", label: "Сбор начат" },
    { value: "finished", label: "Завершена" },
    { value: "rejected", label: "Отклонена" },
    { value: "deleted", label: "Удалена" },
];

const getStatusTranslation = (status: string) => statusTranslations[status] || status;

const formatUserName = (user?: OrderUser | User) => {
    if (!user) return "Не указан";
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
    return fullName || user.name || user.email || "Не указан";
};

const formatDate = (value?: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("ru-RU");
};

const formatAmount = (value?: number) => new Intl.NumberFormat("ru-RU").format(value || 0);

export default function Admin() {
    const token = localStorage.getItem("token");
    const authHeaders = useMemo(
        () => ({ Authorization: `Bearer ${token}` }),
        [token]
    );

    const [me, setMe] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [statusFilter, setStatusFilter] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [creatorFilter, setCreatorFilter] = useState("");
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState<string | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

    const loadProfile = useCallback(async () => {
        if (!token) return;

        try {
            const { data } = await axios.get<User>(`/api/profile`, {
                headers: authHeaders,
            });
            setMe(data);
        } catch (error) {
            console.error(error);
        }
    }, [authHeaders, token]);

    const loadUsers = useCallback(async () => {
        if (!token) return;

        try {
            const { data } = await axios.get<User[]>(`/api/users`, {
                headers: authHeaders,
            });
            setUsers(data);
        } catch (error) {
            console.error(error);
        }
    }, [authHeaders, token]);

    const loadOrders = useCallback(async (showLoading = false) => {
        if (!token) return;

        if (showLoading) {
            setOrdersLoading(true);
        }

        try {
            const { data } = await axios.get<AdminOrder[]>(`/api/orders`, {
                headers: authHeaders,
                params: {
                    status: statusFilter || undefined,
                    from: fromDate || undefined,
                    to: toDate || undefined,
                },
            });
            setOrders(data);
            setOrdersError(null);
            setLastUpdatedAt(new Date());
        } catch (error) {
            console.error(error);
            setOrdersError("Не удалось загрузить заявки");
        } finally {
            setOrdersLoading(false);
        }
    }, [authHeaders, fromDate, statusFilter, toDate, token]);

    useEffect(() => {
        void loadProfile();
        void loadUsers();
    }, [loadProfile, loadUsers]);

    useEffect(() => {
        void loadOrders(true);

        const intervalId = window.setInterval(() => {
            void loadOrders();
        }, POLLING_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [loadOrders]);

    const filteredOrders = useMemo(() => {
        const query = creatorFilter.trim().toLowerCase();
        if (!query) return orders;

        return orders.filter((order) => {
            const creator = order.creator;
            const creatorText = [
                creator?.name,
                creator?.first_name,
                creator?.last_name,
                creator?.email,
                order.creator_id?.toString(),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return creatorText.includes(query);
        });
    }, [creatorFilter, orders]);

    const handleStatusChange = async (orderId: number, status: "draft" | "rejected") => {
        setUpdatingOrderId(orderId);
        setOrdersError(null);

        try {
            await axios.put(`/api/orders/${orderId}/moderate`, {}, {
                headers: authHeaders,
                params: { status },
            });
            await loadOrders();
        } catch (error) {
            console.error(error);
            const message = axios.isAxiosError<{ error?: string }>(error)
                ? error.response?.data?.error || "Не удалось изменить статус заявки"
                : "Не удалось изменить статус заявки";
            setOrdersError(message);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleFormOrder = async (orderId: number) => {
        setUpdatingOrderId(orderId);
        setOrdersError(null);

        try {
            await axios.put(`/api/orders/${orderId}/form`, {}, {
                headers: authHeaders,
            });
            await loadOrders();
        } catch (error) {
            console.error(error);
            const message = axios.isAxiosError<{ error?: string }>(error)
                ? error.response?.data?.error || "Не удалось сформировать заявку"
                : "Не удалось сформировать заявку";
            setOrdersError(message);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleDeleteOrder = async (orderId: number) => {
        if (!confirm("Удалить заявку?")) return;

        setUpdatingOrderId(orderId);
        setOrdersError(null);

        try {
            await axios.delete(`/api/orders/${orderId}`, {
                headers: authHeaders,
            });
            await loadOrders();
        } catch (error) {
            console.error(error);
            const message = axios.isAxiosError<{ error?: string }>(error)
                ? error.response?.data?.error || "Не удалось удалить заявку"
                : "Не удалось удалить заявку";
            setOrdersError(message);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const renderOrderActions = (order: AdminOrder) => {
        const isUpdating = updatingOrderId === order.id;

        const actions = {
            form: (
                <Button
                    key="form"
                    type="button"
                    size="sm"
                    variant="success"
                    disabled={isUpdating}
                    onClick={() => handleFormOrder(order.id)}
                >
                    Сформировать
                </Button>
            ),
            delete: (
                <Button
                    key="delete"
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={isUpdating}
                    onClick={() => handleDeleteOrder(order.id)}
                >
                    Удалить
                </Button>
            ),
            reject: (
                <Button
                    key="reject"
                    type="button"
                    size="sm"
                    variant="warning"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(order.id, "rejected")}
                >
                    Отклонить
                </Button>
            ),
            draft: (
                <Button
                    key="draft"
                    type="button"
                    size="sm"
                    variant="primary"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(order.id, "draft")}
                >
                    Вернуть в черновик
                </Button>
            ),
        };

        switch (order.status) {
            case "draft":
                return [actions.form, actions.delete, actions.reject];
            case "formed":
                return [actions.delete, actions.reject, actions.draft];
            case "finished":
                return [actions.delete];
            case "rejected":
            case "reject":
                return [actions.reject, actions.delete];
            case "collection_started":
            case "deleted":
            default:
                return <span style={{ color: "var(--text-muted)" }}>Нет действий</span>;
        }
    };

    if (!me) return <p style={{textAlign: "center", marginTop: 100}}>Loading...</p>;

    return (
        <>
            <NavigationBar/>
            <div className="container">

                <h2 className="search-title">Админ панель</h2>

                <div className="card" style={{
                    maxWidth: 500,
                    margin: "0 auto 40px",
                    padding: 20
                }}>
                    <h3 className="card-title">{formatUserName(me)}</h3>
                    <p>Email: {me.email}</p>
                    <p>Роль: {getUserRoleName(me)}</p>
                </div>

                <h3 style={{
                    marginBottom: 20,
                    color: "var(--primary)",
                    textAlign: "center"
                }}>
                    Заявки
                </h3>

                <div className="card" style={{ padding: 20, marginBottom: 24 }}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 16,
                        alignItems: "end"
                    }}>
                        <label style={{ display: "grid", gap: 8 }}>
                            Статус
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                            >
                                {statusOptions.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label style={{ display: "grid", gap: 8 }}>
                            Дата формирования с
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(event) => setFromDate(event.target.value)}
                                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                            />
                        </label>
                        <label style={{ display: "grid", gap: 8 }}>
                            Дата формирования по
                            <input
                                type="date"
                                value={toDate}
                                onChange={(event) => setToDate(event.target.value)}
                                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                            />
                        </label>
                        <label style={{ display: "grid", gap: 8 }}>
                            Создатель
                            <input
                                type="search"
                                value={creatorFilter}
                                onChange={(event) => setCreatorFilter(event.target.value)}
                                placeholder="Имя, email или ID"
                                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                            />
                        </label>
                    </div>
                    <div style={{ marginTop: 14, color: "var(--text-muted)", fontSize: 14 }}>
                        {lastUpdatedAt
                            ? `Обновлено: ${lastUpdatedAt.toLocaleTimeString("ru-RU")}`
                            : "Обновление каждые 5 секунд"}
                    </div>
                </div>

                {ordersError && <p style={{ color: "red", textAlign: "center" }}>{ordersError}</p>}
                {ordersLoading && <p style={{ textAlign: "center" }}>Загрузка заявок...</p>}

                {!ordersLoading && (
                    <div style={{ overflowX: "auto", marginBottom: 40 }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                            <tr>
                                <th style={{border: "1px solid #ddd", padding: 10, textAlign: "left"}}>ID</th>
                                <th style={{border: "1px solid #ddd", padding: 10, textAlign: "left"}}>Здание</th>
                                <th style={{border: "1px solid #ddd", padding: 10, textAlign: "left"}}>Создатель</th>
                                <th style={{border: "1px solid #ddd", padding: 10, textAlign: "left"}}>Статус</th>
                                <th style={{border: "1px solid #ddd", padding: 10, textAlign: "left"}}>Сумма</th>
                                <th style={{border: "1px solid #ddd", padding: 10, textAlign: "left"}}>Дата формирования</th>
                                <th style={{border: "1px solid #ddd", padding: 10, textAlign: "left"}}>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{border: "1px solid #ddd", padding: 16, textAlign: "center"}}>
                                        Заявки не найдены
                                    </td>
                                </tr>
                            )}
                            {filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td style={{border: "1px solid #ddd", padding: 10}}>{order.id}</td>
                                    <td style={{border: "1px solid #ddd", padding: 10}}>
                                        <div>{order.building?.name || "Без названия"}</div>
                                        <div style={{fontSize: 13, color: "var(--text-muted)"}}>
                                            {order.building?.address}
                                        </div>
                                    </td>
                                    <td style={{border: "1px solid #ddd", padding: 10}}>
                                        <div>{formatUserName(order.creator)}</div>
                                        <div style={{fontSize: 13, color: "var(--text-muted)"}}>
                                            {order.creator?.email || `ID: ${order.creator_id || "-"}`}
                                        </div>
                                    </td>
                                    <td style={{border: "1px solid #ddd", padding: 10}}>
                                        {getStatusTranslation(order.status)}
                                    </td>
                                    <td style={{border: "1px solid #ddd", padding: 10}}>
                                        {formatAmount(order.total_amount)} ₽
                                    </td>
                                    <td style={{border: "1px solid #ddd", padding: 10}}>
                                        {formatDate(order.created_at)}
                                    </td>
                                    <td style={{border: "1px solid #ddd", padding: 10}}>
                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                            {renderOrderActions(order)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

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
                                <div className="card-title">{formatUserName(user)}</div>
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
                                    {getUserRoleName(user)}
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
