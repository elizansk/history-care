import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import NavigationBar from "../components/NavigationBar.tsx";
import Footer from "../components/Footer.tsx";
import { getUserRoleName } from "../utils/auth";
import { getMockUserFromToken, isMockAuthAvailable, mockUsers } from "../mock/auth.mock";
import { mockOrders } from "../mock/reconstruction.mock";
import '../resources/css/Admin.css';

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

const POLLING_INTERVAL_MS = 5000;//обновление каждые 5 секунд

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

const getMockAdminOrders = (status?: string, from?: string, to?: string): AdminOrder[] => {
    let result = mockOrders.map((order) => ({
        id: order.id,
        building: {
            name: order.building.name,
            address: order.building.address,
        },
        creator: mockUsers.find((user) => user.id === order.creator_id) || mockUsers[1],
        creator_id: order.creator_id,
        status: order.status,
        total_amount: order.total_amount,
        collected_amount: order.collected_amount,
        created_at: order.created_at,
        completed_at: order.completed_at,
    }));

    if (status) {
        result = result.filter((order) => order.status === status);
    }

    if (from) {
        result = result.filter((order) => new Date(order.created_at || "") >= new Date(from));
    }

    if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        result = result.filter((order) => new Date(order.created_at || "") <= toDate);
    }

    return result;
};

export default function Admin() {
    const token = localStorage.getItem("token");
    const authHeaders = useMemo(
        () => ({ Authorization: `Bearer ${token}` }),
        [token]
    );

    const [me, setMe] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [statusFilter, setStatusFilter] = useState("");//фильстрация
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [creatorFilter, setCreatorFilter] = useState("");//фильтриция по создателю
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

            if (isMockAuthAvailable) {
                const mockUser = getMockUserFromToken(token);

                if (mockUser) {
                    setMe(mockUser);
                }
            }
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

            if (isMockAuthAvailable) {
                setUsers(mockUsers);
            }
        }
    }, [authHeaders, token]);

    const loadOrders = useCallback(async (showLoading = false) => {//запрос на бек
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

            if (isMockAuthAvailable) {
                setOrders(getMockAdminOrders(statusFilter, fromDate, toDate));
                setOrdersError(null);
                setLastUpdatedAt(new Date());
            } else {
                setOrdersError("Не удалось загрузить заявки");
            }
        } finally {
            setOrdersLoading(false);
        }
    }, [authHeaders, fromDate, statusFilter, toDate, token]);

    useEffect(() => {
        void loadProfile();
        void loadUsers();
    }, [loadProfile, loadUsers]);

    useEffect(() => {//повторно запрашивает список заявок
        void loadOrders(true);

        const intervalId = window.setInterval(() => {
            void loadOrders();
        }, POLLING_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [loadOrders]);

    const filteredOrders = useMemo(() => {//филтр по создателю
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
            if (isMockAuthAvailable) {
                setOrders((previous) =>
                    previous.map((order) =>
                        order.id === orderId ? { ...order, status } : order
                    )
                );
                setLastUpdatedAt(new Date());
                setUpdatingOrderId(null);
                return;
            }
            const message = axios.isAxiosError<{ error?: string }>(error)
                ? error.response?.data?.error || "Не удалось изменить статус заявки"
                : "Не удалось изменить статус заявки";
            setOrdersError(message);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleFormOrder = async (orderId: number) => {//формирование заявки
        setUpdatingOrderId(orderId);
        setOrdersError(null);

        try {
            await axios.put(`/api/orders/${orderId}/form`, {}, {
                headers: authHeaders,
            });
            await loadOrders();
        } catch (error) {
            console.error(error);
            if (isMockAuthAvailable) {
                setOrders((previous) =>
                    previous.map((order) =>
                        order.id === orderId ? { ...order, status: "formed" } : order
                    )
                );
                setLastUpdatedAt(new Date());
                setUpdatingOrderId(null);
                return;
            }
            const message = axios.isAxiosError<{ error?: string }>(error)
                ? error.response?.data?.error || "Не удалось сформировать заявку"
                : "Не удалось сформировать заявку";
            setOrdersError(message);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleDeleteOrder = async (orderId: number) => {//удаление заявки
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
            if (isMockAuthAvailable) {
                setOrders((previous) => previous.filter((order) => order.id !== orderId));
                setLastUpdatedAt(new Date());
                setUpdatingOrderId(null);
                return;
            }
            const message = axios.isAxiosError<{ error?: string }>(error)
                ? error.response?.data?.error || "Не удалось удалить заявку"
                : "Не удалось удалить заявку";
            setOrdersError(message);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const renderOrderActions = (order: AdminOrder) => {//кнопки смены статусов
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
                return <span className="admin-muted">Нет действий</span>;
        }
    };

    if (!me) return <p className="admin-loading">Loading...</p>;

    return (
        <>
            <NavigationBar/>
            <div className="container admin-page">

                <h2 className="search-title">Админ панель</h2>

                <div className="card admin-profile-card">
                    <h3 className="card-title">{formatUserName(me)}</h3>
                    <p>Email: {me.email}</p>
                    <p>Роль: {getUserRoleName(me)}</p>
                </div>

                <h3 className="admin-section-title">
                    Заявки
                </h3>

                <div className="card admin-filters-card">
                    <div className="admin-filters-grid">
                        <label className="admin-filter-field">
                            Статус
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                            >
                                {statusOptions.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="admin-filter-field">
                            Дата формирования с
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(event) => setFromDate(event.target.value)}
                            />
                        </label>
                        <label className="admin-filter-field">
                            Дата формирования по
                            <input
                                type="date"
                                value={toDate}
                                onChange={(event) => setToDate(event.target.value)}
                            />
                        </label>
                        <label className="admin-filter-field">
                            Создатель
                            <input
                                type="search"
                                value={creatorFilter}
                                onChange={(event) => setCreatorFilter(event.target.value)}
                                placeholder="Имя, email или ID"
                            />
                        </label>
                    </div>
                    <div className="admin-updated-at">
                        {lastUpdatedAt
                            ? `Обновлено: ${lastUpdatedAt.toLocaleTimeString("ru-RU")}`
                            : "Обновление каждые 5 секунд"}
                    </div>
                </div>

                {ordersError && <p className="admin-error">{ordersError}</p>}
                {ordersLoading && <p className="admin-loading-text">Загрузка заявок...</p>}

                {!ordersLoading && (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Здание</th>
                                <th>Создатель</th>
                                <th>Статус</th>
                                <th>Сумма</th>
                                <th>Дата формирования</th>
                                <th>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="admin-empty-cell">
                                        Заявки не найдены
                                    </td>
                                </tr>
                            )}
                            {filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>
                                        <div>{order.building?.name || "Без названия"}</div>
                                        <div className="admin-small-muted">
                                            {order.building?.address}
                                        </div>
                                    </td>
                                    <td>
                                        <div>{formatUserName(order.creator)}</div>
                                        <div className="admin-small-muted">
                                            {order.creator?.email || `ID: ${order.creator_id || "-"}`}
                                        </div>
                                    </td>
                                    <td>
                                        {getStatusTranslation(order.status)}
                                    </td>
                                    <td>
                                        {formatAmount(order.total_amount)} ₽
                                    </td>
                                    <td>
                                        {formatDate(order.created_at)}
                                    </td>
                                    <td>
                                        <div className="admin-actions">
                                            {renderOrderActions(order)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <h3 className="admin-section-title">
                    Все пользователи
                </h3>

                <div className="grid">
                    {users.map(user => (
                        <div key={user.id} className="card">
                            <div className="card-content">
                                <div className="card-title">{formatUserName(user)}</div>
                                <div className="admin-user-email">
                                    {user.email}
                                </div>

                                <div className={`admin-role-badge ${
                                    user.Role?.name === "Admin"
                                        ? "admin-role-admin"
                                        : user.Role?.name === "City"
                                            ? "admin-role-city"
                                            : ""
                                }`}>
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
