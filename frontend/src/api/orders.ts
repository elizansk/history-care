import axios from 'axios';
import { mockOrders } from '../mock/reconstruction.mock';
import type { MockOrder } from '../mock/reconstruction.mock';

export type { MockOrder };

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
    try {
        const { data } = await axios.get<MockOrder[]>('/api/orders/formed', {
            params: { categoryId, cityId, from, to },//создаём строку запроса
            withCredentials: true,
        });
        console.log('Fetched orders:', data);
        return data;
    } catch  {
        console.warn('Using mock data for getFormedOrders');
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
}

export async function getOrderById(id: number): Promise<MockOrder> {
    try {
        const { data } = await axios.get<MockOrder>(`/api/orders/${id}`, {
            withCredentials: true,
        });
        return data;
    } catch {
        console.warn('Using mock data for getOrderById');
        const order = mockOrders.find(o => o.id === id);
        if (!order) {
            throw new Error('Order not found');
        }
        return order;
    }
}
