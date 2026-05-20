import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavigationBar from '../components/NavigationBar';

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
    <div className="container">
      <NavigationBar />
      <div style={{ marginTop: 24 }}>
        <h2>Мои заявки</h2>
        <div style={{ marginBottom: 20 }}>
          <Link to="/profile" style={{ marginRight: 12, color: '#0e5a3c', fontWeight: 600 }}>
            Назад в личный кабинет
          </Link>
          {!orders.find(x => x.status === 'draft') && (
              <Link
                  to="/create-order"
                  style={{ color: '#0e5a3c', fontWeight: 600 }}
              >
                Создать новую заявку
              </Link>
          )}
        </div>
        {loading && <p>Загрузка заявок...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && orders.length === 0 && <p>Заявок пока нет.</p>}
        {!loading && !error && orders.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
            <tr>
              <th style={{border: '1px solid #ddd', padding: '10px', textAlign: 'left'}}>ID</th>
              <th style={{border: '1px solid #ddd', padding: '10px', textAlign: 'left'}}>Здание</th>
              <th style={{border: '1px solid #ddd', padding: '10px', textAlign: 'left'}}>Адрес</th>
              <th style={{border: '1px solid #ddd', padding: '10px', textAlign: 'left'}}>Статус</th>
              <th style={{border: '1px solid #ddd', padding: '10px', textAlign: 'left'}}>Сумма</th>
              <th style={{border: '1px solid #ddd', padding: '10px', textAlign: 'left'}}>Дата создания</th>
              <th style={{border: '1px solid #ddd', padding: '10px', textAlign: 'left'}}>Действия</th>
            </tr>
            </thead>
            <tbody>
            {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{border: '1px solid #ddd', padding: '10px'}}>{order.id}</td>
                  <td style={{border: '1px solid #ddd', padding: '10px'}}>{order.building.name}</td>
                  <td style={{border: '1px solid #ddd', padding: '10px'}}>{order.building.address}</td>
                  <td style={{border: '1px solid #ddd', padding: '10px'}}>{getStatusTranslation(order.status)}</td>
                  <td style={{border: '1px solid #ddd', padding: '10px'}}>{order.total_amount}</td>
                  <td style={{
                    border: '1px solid #ddd',
                    padding: '10px'
                  }}>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td style={{
                    border: '1px solid #ddd',
                    padding: '10px'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {order.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleEdit(order.id)}
                            style={{
                              padding: '6px 12px',
                              background: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDelete(order.id)}
                            style={{
                              padding: '6px 12px',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Удалить
                          </button>
                          <button
                            onClick={() => handlePublish(order.id)}
                            style={{
                              padding: '6px 12px',
                              background: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Опубликовать
                          </button>
                        </>
                      )}
                      {(order.status === 'formed' || order.status === 'collection_started') && (
                        <span style={{ color: '#6c757d', fontStyle: 'italic' }}>
                          Действия недоступны
                        </span>
                      )}
                      {(order.status === 'finished' || order.status === 'rejected') && (
                        <span style={{ color: '#6c757d', fontStyle: 'italic' }}>
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
