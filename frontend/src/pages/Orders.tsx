import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import NavigationBar from '../components/NavigationBar';
import Breadcrumbs from '../components/Breadcrumbs';
import { getFormedOrders } from '../api/orders';
import type { MockOrder } from '../api/orders';
import { getCategories, getCities } from '../api/filters';
import type { Category, City } from '../api/filters';
import Footer from '../components/Footer';
import type { AppDispatch, RootState } from '../store';
import { setBuildingsFilter } from '../store/buildings-filter-slice';
import type { BuildingsFiltersState } from '../store/buildings-filter-slice';
import '../resources/css/Orders.css';

const Buildings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.buildingsFilters);//берем значения их редакс
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedInitialOrders = useRef(false);

  useEffect(() => {//вызыв после первого render компонента
    const fetchFilters = async () => {
      try {
        setCategories(await getCategories());
        setCities(await getCities());
      } catch (err) {
        console.error('Failed to load filters', err);
      }
    };
    fetchFilters();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    dispatch(setBuildingsFilter({//при изменении фильтра новое значение сохраняется в Redux
      name: e.target.name as keyof BuildingsFiltersState,
      value: e.target.value,
    }));
  };

  const applyFilters = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }
    setError(null);
    try {
      const categoryId = filters.categoryId ? parseInt(filters.categoryId, 10) : undefined;
      const cityId = filters.cityId ? parseInt(filters.cityId, 10) : undefined;
      const data = await getFormedOrders(categoryId, cityId, filters.from || undefined, filters.to || undefined);
      setOrders(data);
    } catch  {
      setError('Не удалось загрузить заявки.');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    if (hasLoadedInitialOrders.current) return;
    hasLoadedInitialOrders.current = true;
    void applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void applyFilters(false);
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [applyFilters]);

  const getImageUrl = (order: MockOrder) => {
    const photo = order.building.resources.find((resource) => resource.resource_type === 'photo');
    return photo?.url || order.building.resources[0]?.url || '';
  };

  const formatAmount = (value: number) => new Intl.NumberFormat('ru-RU').format(value);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('ru-RU',
     { day: 'numeric', month: 'long', year: 'numeric' });
  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Исторические здания'},
  ];

  return (
    <>
      <NavigationBar />
      <Container className="page-container orders-page mt-4">
        <div className="page-inner">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="buildings-header">
            <h1>Наследие Нации</h1>
            <p className="buildings-subtitle">Поиск объектов культурного наследия с фильтрами по региону, категории и дате.</p>
          </div>

          <div className="search-panel mb-4">
          <div className="search-group">
            <label>Категория</label>
            <Form.Select name="categoryId" value={filters.categoryId} onChange={handleFilterChange}>
              <option value="">Все категории</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Form.Select>
          </div>

          <div className="search-group">
            <label>Город</label>
            <Form.Select name="cityId" value={filters.cityId} onChange={handleFilterChange}>
              <option value="">Все города</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </Form.Select>
          </div>

          <div className="search-group">
            <label>Дата от</label>
            <Form.Control type="date" name="from" value={filters.from} onChange={handleFilterChange} />
          </div>

          <div className="search-group">
            <label>Дата до</label>
            <Form.Control type="date" name="to" value={filters.to} onChange={handleFilterChange} />
          </div>

          <div className="search-group search-action">
            <Button variant="success" onClick={() => void applyFilters()} disabled={loading}>
              {loading ? 'Загрузка...' : 'Показать'}
            </Button>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {orders.length === 0 && !error ? (
          <div className="no-results">По выбранным фильтрам заявки на реконструкцию не найдены.</div>
        ) : (
          <div className="grid">
            {orders.map((order) => (
              <article className="card" key={order.id}>
                {getImageUrl(order) && <img src={getImageUrl(order)} alt={order.building.name} />}
                <div className="card-content">

                  <h2 className="card-title">{order.building.name}</h2>
                  <p className="card-description">
                    {order.building.description}
                  </p>
                  <div className="card-details">
                    <div>Категория: <strong>{order.building.category.name}</strong></div>
                    <div>Город: <strong>{order.building.city.name}</strong></div>
                    <div>Адрес: <strong>{order.building.address}</strong></div>
                    <div>Собрано: <strong>{formatAmount(order.collected_amount)} из {formatAmount(order.total_amount)} ₽</strong></div>
                    <div>Дата создания: <strong>{formatDate(order.created_at)}</strong></div>
                  </div>
                  <div className="card-actions">
                    <Link to={`/building/${order.id}`} className="btn btn-success">Подробнее</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Container>
    <Footer />
  </>
  );
};

export default Buildings;
