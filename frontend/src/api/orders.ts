import { mockOrders } from '../mock/reconstruction.mock';
import type { MockOrder } from '../mock/reconstruction.mock';

export type { MockOrder };

export async function createDraftOrder(buildingId: number) {
    const res = await fetch("/api/orders/draft", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ building_id: buildingId }),
        credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error || "Failed to create draft order");
    }

    return data;
}

export async function getFormedOrders(categoryId?: number, cityId?: number, from?: string, to?: string): Promise<MockOrder[]> {
    try {
        const params = new URLSearchParams();
        if (categoryId) params.append('categoryId', categoryId.toString());
        if (cityId) params.append('cityId', cityId.toString());
        if (from) params.append('from', from);
        if (to) params.append('to', to);

        const res = await fetch(`/api/orders/formed?${params}`, {
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error('API not available');
        }
        const data = await res.json();
        console.log('Fetched orders:', data);
        return data;
    } catch  {
        console.warn('Using mock data for getFormedOrders');
        let filtered = mockOrders;
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
        const res = await fetch(`/api/orders/${id}`, {
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error('API not available');
        }

        return await res.json();
    } catch {
        console.warn('Using mock data for getOrderById');
        const order = mockOrders.find(o => o.id === id);
        if (!order) {
            throw new Error('Order not found');
        }
        return order;
    }
}