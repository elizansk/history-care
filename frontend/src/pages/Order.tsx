import React, { useState, useEffect } from 'react';
import { Container, Alert, Modal } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Breadcrumbs from '../components/Breadcrumbs';
import { getOrderById } from '../api/orders';
import type { MockOrder } from '../api/orders';
import Footer from '../components/Footer';
import '../resources/css/Order.css';
const Building: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<MockOrder | null>(null);//Хранит объект заявки
  const [loading, setLoading] = useState(true);//Флаг загрузки
  const [error, setError] = useState<string | null>(null);//Хранит текст ошибки
  const [showModal, setShowModal] = useState(false);//Показывать ли модальное окно
  const [modalImage, setModalImage] = useState<string>('');//URL изображения для modal окна

  useEffect(() => {//загрузка данных
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const data = await getOrderById(parseInt(id));
        setOrder(data);
      } catch  {
        setError('Не удалось загрузить данные объекта');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);//заново при изменении


  if (loading) return <div className="text-center p-5">Загрузка...</div>;
  if (error || !order) return <Alert variant="danger">{error || 'Объект не найден'}</Alert>;

  const mainVideo = order.building.resources.find(r => r.resource_type === 'video' && r.is_main);
  const mainPhoto = order.building.resources.find(r => r.resource_type === 'photo' && r.is_main);
  const otherResources = order.building.resources.filter(r => !r.is_main);
  console.log('Order details:', order);
  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Исторические здания', href: '/buildings' },
    { label: order.building.name },
  ];

  const formatAmount = (value: number) => new Intl.NumberFormat('ru-RU').format(value);

  const handleImageClick = (url: string) => {
    setModalImage(url);
    setShowModal(true);
  };

  return (
    <>
      <NavigationBar />
      <Container className="page-container order-page mt-4">
        <div className="page-inner">

          <Breadcrumbs items={breadcrumbItems} />

          <div className="building-header">
            <h1 className="building-title">{order.building.name}</h1>
            <h2 className="building-address">{order.building.address}, {order.building.city.name}</h2>
          </div>

          <div className="building-content">
            {mainPhoto && (
             
              <img src={mainPhoto.url} alt={order.building.name} className="building-media building-image" />
            )}
            {mainVideo && (
              <video className="building-media" controls>
                <source src={mainVideo.url} type="video/mp4" />
                Ваш браузер не поддерживает видео.
              </video>
            )}

            <p className="building-description">{order.building.description}</p>

            <div className="building-info-grid">
              <div className="info-item">
                <span className="info-label">Категория:</span>
                <span className="info-value">{order.building.category.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Город:</span>
                <span className="info-value">{order.building.city.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Собрано:</span>
                <span className="info-value">{formatAmount(order.collected_amount)} из {formatAmount(order.total_amount)} ₽</span>
              </div>
            </div>

            {order.services && order.services.length > 0 && (
              <section className="building-section">
                <h3 className="section-title">Услуги реконструкции</h3>
                <div className="services-grid">
                  {order.services.map(service => (
                    <article className="service-card" key={service.id}>
                      {service.service.image_url && (
                        <img src={service.service.image_url} alt={service.service.name} className="service-icon" />
                      )}
                      <div className="service-content">
                        <h4 className="service-name">{service.service.name}</h4>
                        {service.description && <p className="service-description">{service.description}</p>}
                        <div className="service-price">{formatAmount(service.price)} ₽</div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {otherResources.length > 0 && (
              <section className="building-section">
                <h3 className="section-title">Материалы</h3>
                <div className="materials-grid">
                  {otherResources.map(resource => (
                    <div
                      key={resource.id}
                      className="material-item"
                      onClick={() => handleImageClick(resource.url)}
                    >
                      {resource.resource_type === 'photo' && <img src={resource.url} alt="Material" />}
                      {resource.resource_type === 'video' && (
                        <div className="video-thumbnail">
                          <video src={resource.url} />
                          <span className="play-icon">▶</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="building-actions">
              <Link to={`/donate/${id}`} className="btn btn-success btn-lg">
                Помочь объекту
              </Link>
            </div>

          </div>

          <Footer />
        </div>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Body className="text-center">
          <img src={modalImage} alt="Material" className="img-fluid" />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Building;
