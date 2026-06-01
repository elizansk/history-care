import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import NavigationBar from "../components/NavigationBar.tsx";
import Footer from "../components/Footer.tsx";
import { getUserRoleName } from "../utils/auth";
import { clearCreateOrderSession } from "../utils/session";
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
    role?: string | Role;
    roleId?: number;
    Role?: Role;
    city_id?: number;
    city?: {
        id: number;
        name: string;
    };
    city_approved?: boolean;
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

interface ServiceFormState {
    name: string;
    description: string;
    icon: File | null;
}

const POLLING_INTERVAL_MS = 5000;//обновление каждые 5 секунд

const statusTranslations: Record<string, string> = {
    draft: "Черновик",
    pending_review: "На проверке",
    formed: "Опубликована",
    collection_started: "Сбор начат",
    finished: "Завершена",
    rejected: "Отклонена",
    reject: "Отклонена",
    deleted: "Удалена",
};

const statusOptions = [
    { value: "", label: "Все статусы" },
    { value: "draft", label: "Черновик" },
    { value: "pending_review", label: "На проверке" },
    { value: "formed", label: "Опубликована" },
    { value: "collection_started", label: "Сбор начат" },
    { value: "finished", label: "Завершена" },
    { value: "rejected", label: "Отклонена" },
    { value: "deleted", label: "Удалена" },
];

const getStatusTranslation = (status: string) => statusTranslations[status] || status;

const getStatusClassName = (status: string) => {
    switch (status) {
        case "pending_review":
            return "admin-status-badge admin-status-review";
        case "formed":
        case "collection_started":
            return "admin-status-badge admin-status-published";
        case "rejected":
        case "reject":
            return "admin-status-badge admin-status-rejected";
        case "draft":
            return "admin-status-badge admin-status-draft";
        case "finished":
            return "admin-status-badge admin-status-finished";
        case "deleted":
            return "admin-status-badge admin-status-deleted";
        default:
            return "admin-status-badge";
    }
};

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
    const [usersError, setUsersError] = useState<string | null>(null);
    const [usersMessage, setUsersMessage] = useState<string | null>(null);
    const [approvingCityUserId, setApprovingCityUserId] = useState<number | null>(null);
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [statusFilter, setStatusFilter] = useState("");//фильстрация
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [creatorFilter, setCreatorFilter] = useState("");//фильтриция по создателю
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState<string | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
    const [serviceForm, setServiceForm] = useState<ServiceFormState>({
        name: "",
        description: "",
        icon: null,
    });
    const [serviceSubmitting, setServiceSubmitting] = useState(false);
    const [serviceMessage, setServiceMessage] = useState<string | null>(null);
    const [serviceError, setServiceError] = useState<string | null>(null);

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
            setUsersError(null);
        } catch (error) {
            console.error(error);

            if (isMockAuthAvailable) {
                setUsers(mockUsers);
                setUsersError(null);
            } else {
                setUsersError("Не удалось загрузить пользователей");
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

    const adminStats = useMemo(() => {
        const pendingOrders = orders.filter((order) => order.status === "pending_review").length;
        const publishedOrders = orders.filter((order) =>
            order.status === "formed" || order.status === "collection_started"
        ).length;
        const waitingCityUsers = users.filter((user) =>
            getUserRoleName(user) === "City" && user.city_approved !== true
        ).length;
        const totalCollected = orders.reduce((sum, order) => sum + (order.collected_amount || 0), 0);

        return {
            pendingOrders,
            publishedOrders,
            waitingCityUsers,
            totalCollected,
        };
    }, [orders, users]);

    const handleStatusChange = async (orderId: number, status: "formed" | "draft" | "rejected") => {
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
                        order.id === orderId ? { ...order, status: "pending_review" } : order
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

    const handleCityApprovalChange = async (userId: number, cityApproved: boolean) => {
        setApprovingCityUserId(userId);
        setUsersError(null);
        setUsersMessage(null);

        try {
            await axios.put(`/api/users/${userId}/city-approval`, {
                city_approved: cityApproved,
            }, {
                headers: authHeaders,
            });

            setUsers((previous) =>
                previous.map((user) =>
                    user.id === userId ? { ...user, city_approved: cityApproved } : user
                )
            );
            setUsersMessage(cityApproved ? "City-пользователь подтвержден" : "Подтверждение City-пользователя снято");
        } catch (error) {
            console.error(error);
            const message = axios.isAxiosError<{ error?: string }>(error)
                ? error.response?.data?.error || "Не удалось обновить подтверждение пользователя"
                : "Не удалось обновить подтверждение пользователя";
            setUsersError(message);
        } finally {
            setApprovingCityUserId(null);
        }
    };

    const handleCreateService = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!serviceForm.name.trim()) {
            setServiceError("Введите название услуги");
            return;
        }

        if (!serviceForm.icon) {
            setServiceError("Добавьте иконку услуги");
            return;
        }

        const formData = new FormData();
        formData.append("name", serviceForm.name.trim());
        formData.append("description", serviceForm.description.trim());
        formData.append("image", serviceForm.icon);

        setServiceSubmitting(true);
        setServiceError(null);
        setServiceMessage(null);

        try {
            await axios.post("/api/services", formData, {
                headers: {
                    ...authHeaders,
                    "Content-Type": "multipart/form-data",
                },
            });
            localStorage.removeItem("history-care:services");
            setServiceForm({
                name: "",
                description: "",
                icon: null,
            });
            setServiceMessage("Услуга создана");
        } catch (error) {
            console.error(error);
            const message = axios.isAxiosError<{ error?: string }>(error)
                ? error.response?.data?.error || "Не удалось создать услугу"
                : "Не удалось создать услугу";
            setServiceError(message);
        } finally {
            setServiceSubmitting(false);
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
                    Отправить на проверку
                </Button>
            ),
            approve: (
                <Button
                    key="approve"
                    type="button"
                    size="sm"
                    variant="success"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(order.id, "formed")}
                >
                    Опубликовать
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
            case "pending_review":
                return [actions.approve, actions.reject, actions.draft];
            case "formed":
                return [actions.reject, actions.draft];
            case "finished":
                return <span className="admin-muted">Нет действий</span>;
            case "rejected":
            case "reject":
                return [actions.draft];
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
            <div className="admin-page">

                <section className="admin-hero">
                    <div>
                        <span className="admin-eyebrow">Панель управления</span>
                        <h1>Администрирование системы</h1>
                        <p>
                            Проверяйте заявки, подтверждайте городских администраторов и управляйте услугами восстановления.
                        </p>
                    </div>
                    <div className="admin-profile-card">
                        <span className="admin-profile-label">Вы вошли как</span>
                        <strong>{formatUserName(me)}</strong>
                        <span>{me.email}</span>
                        <span className="admin-role-badge admin-role-admin">{getUserRoleName(me)}</span>
                    </div>
                </section>

                <section className="admin-stats-grid" aria-label="Сводка">
                    <div className="admin-stat-card">
                        <span>На проверке</span>
                        <strong>{adminStats.pendingOrders}</strong>
                    </div>
                    <div className="admin-stat-card">
                        <span>Опубликовано</span>
                        <strong>{adminStats.publishedOrders}</strong>
                    </div>
                    <div className="admin-stat-card">
                        <span>City ждут подтверждения</span>
                        <strong>{adminStats.waitingCityUsers}</strong>
                    </div>
                    <div className="admin-stat-card">
                        <span>Собрано всего</span>
                        <strong>{formatAmount(adminStats.totalCollected)} ₽</strong>
                    </div>
                </section>

                <section className="admin-workspace-grid">
                    <div className="admin-panel-card admin-create-order-card">
                        <div>
                            <span className="admin-card-kicker">Заявки</span>
                            <h2>Создать заявку от имени города</h2>
                            <p>
                                Администратор может выбрать город в форме и создать черновик, если заявку нужно внести вручную.
                            </p>
                        </div>
                        <Link
                            to="/create-order"
                            className="admin-create-order-link"
                            onClick={clearCreateOrderSession}
                        >
                            Создать заявку
                        </Link>
                    </div>

                    <form className="admin-panel-card admin-service-form" onSubmit={handleCreateService}>
                        <div>
                            <span className="admin-card-kicker">Услуги</span>
                            <h2>Создать услугу</h2>
                        </div>
                        <div className="admin-service-grid">
                            <label className="admin-filter-field">
                                Название
                                <input
                                    type="text"
                                    value={serviceForm.name}
                                    onChange={(event) =>
                                        setServiceForm((previous) => ({
                                            ...previous,
                                            name: event.target.value,
                                        }))
                                    }
                                    placeholder="Например, реставрация фасада"
                                />
                            </label>
                            <label className="admin-filter-field">
                                Иконка
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        setServiceForm((previous) => ({
                                            ...previous,
                                            icon: event.target.files?.[0] || null,
                                        }))
                                    }
                                />
                            </label>
                        </div>
                        <label className="admin-filter-field">
                            Описание
                            <textarea
                                value={serviceForm.description}
                                onChange={(event) =>
                                    setServiceForm((previous) => ({
                                        ...previous,
                                        description: event.target.value,
                                    }))
                                }
                                placeholder="Краткое описание услуги"
                                rows={3}
                            />
                        </label>
                        {serviceError && <p className="admin-error">{serviceError}</p>}
                        {serviceMessage && <p className="admin-success">{serviceMessage}</p>}
                        <div className="admin-service-form-actions">
                            <Button
                                type="submit"
                                variant="success"
                                disabled={serviceSubmitting}
                            >
                                {serviceSubmitting ? "Создание..." : "Создать услугу"}
                            </Button>
                        </div>
                    </form>
                </section>

                <section className="admin-section-block">
                    <div className="admin-section-heading">
                        <div>
                            <span className="admin-card-kicker">Модерация</span>
                            <h2>Заявки</h2>
                        </div>
                        <span>
                            {lastUpdatedAt
                                ? `Обновлено: ${lastUpdatedAt.toLocaleTimeString("ru-RU")}`
                                : "Автообновление каждые 5 секунд"}
                        </span>
                    </div>

                    <div className="admin-filters-card">
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
                                    <th>Дата</th>
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
                                        <td className="admin-id-cell">#{order.id}</td>
                                        <td>
                                            <div className="admin-table-title">{order.building?.name || "Без названия"}</div>
                                            <div className="admin-small-muted">
                                                {order.building?.address || "Адрес не указан"}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="admin-table-title">{formatUserName(order.creator)}</div>
                                            <div className="admin-small-muted">
                                                {order.creator?.email || `ID: ${order.creator_id || "-"}`}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={getStatusClassName(order.status)}>
                                                {getStatusTranslation(order.status)}
                                            </span>
                                        </td>
                                        <td className="admin-amount-cell">
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
                </section>

                <section className="admin-section-block">
                    <div className="admin-section-heading">
                        <div>
                            <span className="admin-card-kicker">Доступы</span>
                            <h2>Пользователи</h2>
                        </div>
                        <span>{users.length} аккаунтов</span>
                    </div>

                    {usersError && <p className="admin-error">{usersError}</p>}
                    {usersMessage && <p className="admin-success">{usersMessage}</p>}

                    <div className="admin-users-grid">
                        {users.map(user => {
                            const roleName = getUserRoleName(user);
                            const isCity = roleName === "City";

                            return (
                                <div key={user.id} className="admin-user-card">
                                    <div>
                                        <div className="admin-table-title">{formatUserName(user)}</div>
                                        <div className="admin-user-email">
                                            {user.email}
                                        </div>
                                    </div>

                                    <div className="admin-user-meta">
                                        <span className={`admin-role-badge ${
                                            roleName === "Admin"
                                                ? "admin-role-admin"
                                                : roleName === "City"
                                                    ? "admin-role-city"
                                                    : ""
                                        }`}>
                                            {roleName}
                                        </span>

                                        {user.city?.name && (
                                            <span className="admin-small-muted">
                                                {user.city.name}
                                            </span>
                                        )}
                                    </div>

                                    {isCity && (
                                        <label className="admin-city-approval">
                                            <input
                                                type="checkbox"
                                                checked={user.city_approved === true}
                                                disabled={approvingCityUserId === user.id}
                                                onChange={(event) =>
                                                    handleCityApprovalChange(user.id, event.target.checked)
                                                }
                                            />
                                            <span>
                                                {user.city_approved === true
                                                    ? "City подтвержден"
                                                    : "Разрешить создание заявок"}
                                            </span>
                                        </label>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
            <Footer/>
        </>
    );
}
