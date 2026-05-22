import axios from 'axios';
import { mockOrders } from '../mock/reconstruction.mock';
import type { MockOrder } from '../mock/reconstruction.mock';

export type { MockOrder };

const useMockOrders = import.meta.env.VITE_USE_MOCKS === 'true' ||
    (import.meta.env.MODE === 'github-pages' && !import.meta.env.VITE_API_URL);

function getMockFormedOrders(categoryId?: number, cityId?: number, from?: string, to?: string): MockOrder[] {
    let filtered = mockOrders;//берём локальные данные
    if (categoryId) {
        filtered = filtered.filter(o => o.building.category_id === categoryId);
    }
    if (cityId) {
        filtered = filtered.filter(o => o.building.city_id === cityId);
    }
    if (from) {
        filtered = filtered.filter(o => o.created_at >= from);
    }
    if (to) {
        filtered = filtered.filter(o => o.created_at <= to);
    }
    return filtered;
}

function getMockOrderById(id: number): MockOrder {
    const order = mockOrders.find(o => o.id === id);
    if (!order) {
        throw new Error('Order not found');
    }
    return order;
}

export async function createDraftOrder(buildingId: number) {//черновик заявки
    try {
        const { data } = await axios.post(
            "/api/orders/draft",
            { building_id: buildingId },//Отправляем backend
            { withCredentials: true }//отправка куки
        );
        return data;
    } catch (error) {
        if (axios.isAxiosError<{ error?: string }>(error)) {
            throw new Error(error.response?.data?.error || "Failed to create draft order");
        }
        throw error;
    }
}

export async function getFormedOrders(categoryId?: number, cityId?: number, from?: string, to?: string): Promise<MockOrder[]> {
    if (useMockOrders) {
        return getMockFormedOrders(categoryId, cityId, from, to);
    }

    try {
        const { data } = await axios.get<MockOrder[]>('/api/orders/formed', {
            params: { categoryId, cityId, from, to },//создаём строку запроса
            withCredentials: true,
        });
        return data;
    } catch {
        return getMockFormedOrders(categoryId, cityId, from, to);
    }
}

export async function getOrderById(id: number): Promise<MockOrder> {
    if (useMockOrders) {
        return getMockOrderById(id);
    }

    try {
        const { data } = await axios.get<MockOrder>(`/api/orders/formed/${id}`, {
            withCredentials: true,
        });
        return data;
    } catch (error) {
        if (!axios.isAxiosError<{ error?: string }>(error)) {
            throw error;
        }

        try {
            const { data } = await axios.get<MockOrder>(`/api/orders/${id}`, {
                withCredentials: true,
            });
            return data;
        } catch {
            // Если пользователь не авторизован или endpoint закрыт, пробуем найти заявку в публичном списке.
        }

        try {
            const orders = await getFormedOrders();
            const order = orders.find(item => item.id === id);
            if (order) {
                return order;
            }
        } catch {
            throw new Error(error.response?.data?.error || 'Order not found');
        }

        return getMockOrderById(id);
    }
}
