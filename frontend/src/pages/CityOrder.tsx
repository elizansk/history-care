import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavigationBar from '../components/NavigationBar';
import '../resources/css/CityOrder.css';

interface Order {
  id: number;
  building: {
    name: string;
    address: string;
  };
  status: string;
  total_amount: number;
  created_at: string;
}
interface OrderService {
  service_id: number;
  price: number;
  quantity: number;
  description: string;
}
interface EditableOrder {
  id: number;
  building_id: number;
  total_amount: number;
  description?: string;
  services: OrderService[];
  building: {
    name: string;
    description?: string;
    address: string;
    category_id: number;
    city_id: number;
  };
}

const statusTranslations: Record<string, string> = {
  draft: 'Черновик',
  formed: 'Опубликована',
  collection_started: 'Сбор начат',
  finished: 'Завершена',
  reject: 'Отклонена',
  deleted: 'Удалена'
};

const getStatusTranslation = (status: string): string => {
  return statusTranslations[status] || status;
};

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState<string | null>(() => token ? null : 'Токен не найден');

  const handleDelete = async (orderId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return;
    try {
      await axios.delete(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Не удалось удалить заявку');
    }
  };

  const handlePublish = async (orderId: number) => {
    try {
      await axios.put(`/api/orders/${orderId}/form`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(prev =>
          prev.map(o =>
              o.id === orderId ? { ...o, status: 'formed' } : o
          )
      );
    } catch (err) {
      console.error('Error publishing order:', err);
      const message = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error || 'Не удалось опубликовать заявку'
        : 'Не удалось опубликовать заявку';
      alert(message);
    }
  };

  const handleEdit = async (orderId: number) => {
    // Загрузить данные заявки и перейти на create-order
    try {
      const res = await axios.get<EditableOrder>(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const order = res.data;
      // Сохранить в sessionStorage как в CreateOrder
      sessionStorage.setItem('buildingId', String(order.building_id));
      sessionStorage.setItem('orderId', String(order.id));
      sessionStorage.setItem('buildingName', order.building.name);
      sessionStorage.setItem('buildingDescription', order.building.description || '');
      sessionStorage.setItem('buildingAddress', order.building.address);
      sessionStorage.setItem('buildingCategoryId', String(order.building.category_id));
      sessionStorage.setItem('buildingCityId', String(order.building.city_id));
      sessionStorage.setItem('orderTotal', String(order.total_amount));
      sessionStorage.setItem('orderDescription', order.description || '');
      // Services: нужно загрузить services из order.services

      const selectedServices = order.services.map((s) => ({
        id: s.service_id,
        price: s.price,
        quantity: s.quantity,
        description: s.description,
      }));
      sessionStorage.setItem('selectedServices', JSON.stringify(selectedServices));
      sessionStorage.setItem('buildingData', JSON.stringify(order.building));
      // Перейти на create-order
      navigate('/create-order');
    } catch (err) {
      console.error('Error loading order for edit:', err);
      alert('Не удалось загрузить заявку для редактирования');
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    axios
      .get<Order[]>('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.error('Error loading orders:', err);
        setError('Не удалось загрузить заявки');
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="container city-order-page">
      <NavigationBar />
      <div className="city-order-content">
        <h2>Мои заявки</h2>
        <div className="city-order-links">
          <Link to="/profile">
            Назад в личный кабинет
          </Link>
          {!orders.find(x => x.status === 'draft') && (
              <Link to="/create-order">
                Создать новую заявку
              </Link>
          )}
        </div>
        {loading && <p>Загрузка заявок...</p>}
        {error && <p className="city-order-error">{error}</p>}
        {!loading && !error && orders.length === 0 && <p>Заявок пока нет.</p>}
        {!loading && !error && orders.length > 0 && (
          <table className="city-order-table">
            <thead>
            <tr>
              <th>ID</th>
              <th>Здание</th>
              <th>Адрес</th>
              <th>Статус</th>
              <th>Сумма</th>
              <th>Дата создания</th>
              <th>Действия</th>
            </tr>
            </thead>
            <tbody>
            {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.building.name}</td>
                  <td>{order.building.address}</td>
                  <td>{getStatusTranslation(order.status)}</td>
                  <td>{order.total_amount}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="city-order-actions">
                      {order.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleEdit(order.id)}
                            className="city-order-button city-order-button-edit"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="city-order-button city-order-button-delete"
                          >
                            Удалить
                          </button>
                          <button
                            onClick={() => handlePublish(order.id)}
                            className="city-order-button city-order-button-publish"
                          >
                            Опубликовать
                          </button>
                        </>
                      )}
                      {(order.status === 'formed' || order.status === 'collection_started') && (
                        <span className="city-order-muted">
                          Действия недоступны
                        </span>
                      )}
                      {(order.status === 'finished' || order.status === 'rejected') && (
                        <span className="city-order-muted">
                          Заявка завершена
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
