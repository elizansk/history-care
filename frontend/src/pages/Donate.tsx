import React, { useState, useEffect } from 'react';
import { Container, Alert, Form, Button, ProgressBar, Modal } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Breadcrumbs from '../components/Breadcrumbs';
import { getOrderById } from '../api/orders';
import { submitDonation } from '../api/donations';
import { getUser } from '../utils/auth';
import type { MockOrder } from '../api/orders';

const Donate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<MockOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: '',
    customAmount: '',
    name: '',
    email: '',
    payment: '',
  });

  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(parseInt(id));
        setOrder(data);
      } catch (err) {
        setError('Не удалось загрузить данные объекта');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading && id) return <div className="text-center p-5">Загрузка...</div>;
  if (error && id) return <Alert variant="danger">{error}</Alert>;

  const mainPhoto = order?.building.resources.find(r => r.resource_type === 'photo' && r.is_main);

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Заявки на реконструкцию', href: '/buildings' },
    { label: order?.building.name || 'Пожертвования', href: order ? `/building/${id}` : '/buildings' },
    { label: 'Пожертвование' },
  ];

  const formatAmount = (value: number) => new Intl.NumberFormat('ru-RU').format(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  console.log('Order data:', order);
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'amount' && value !== 'other') {
      setFormData({ ...formData, amount: value, customAmount: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !id) return;

    setSubmitting(true);
    try {
      const amount = parseInt(formData.amount === 'other' ? formData.customAmount : formData.amount);
      const donationData: any = {
        order_id: parseInt(id),
        amount,
      };

      if (!user) {
        donationData.name = formData.name;
        donationData.email = formData.email;
      }
      console.log('Submitting donation:', donationData);
      await submitDonation(donationData);
      setShowQR(true);
    } catch (err) {
      alert('Ошибка при отправке пожертвования: ' + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const collected = order?.collected_amount || 0;
  const goal = order?.total_amount || 1;
  const progress = (collected / goal) * 100;

  return (
    <>
      <NavigationBar />
      <Container className="page-container mt-4">
        <div className="page-inner">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="donation-header">
            <h1 className="service-title">{order?.building.name || 'Пожертвование'}</h1>
          </div>

          <div className="donation-content">
            {mainPhoto && (
              <img className="donation-image" src={mainPhoto.url} alt={order?.building.name} />
            )}

            {order && (
              <div className="collected-info">
                <p>Собрано: <strong>{formatAmount(collected)} ₽</strong> из {formatAmount(goal)} ₽</p>
                <ProgressBar now={progress} label={`${Math.round(progress)}%`} />
              </div>
            )}

            <div className="donation-intro">
              <p>Здесь вы можете внести свой вклад в сохранение культурного наследия.</p>
              <p>Выберите размер пожертвования и заполните форму ниже.</p>
            </div>

            <Form className="donation-form" onSubmit={handleSubmit}>
              <div className="donation-section">
                <h3>Размер пожертвования</h3>
                <div className="amount-options">
                  <Form.Check
                    type="radio"
                    label="100 ₽"
                    name="amount"
                    value="100"
                    onChange={handleRadioChange}
                  />
                  <Form.Check
                    type="radio"
                    label="300 ₽"
                    name="amount"
                    value="300"
                    onChange={handleRadioChange}
                  />
                  <Form.Check
                    type="radio"
                    label="500 ₽"
                    name="amount"
                    value="500"
                    onChange={handleRadioChange}
                  />
                  <Form.Check
                    type="radio"
                    label="Другая сумма"
                    name="amount"
                    value="other"
                    onChange={handleRadioChange}
                  />
                </div>
                {formData.amount === 'other' && (
                  <Form.Control
                    type="number"
                    name="customAmount"
                    placeholder="Введите сумму"
                    value={formData.customAmount}
                    onChange={handleInputChange}
                    required
                  />
                )}
              </div>

              {!user && (
                <div className="donation-section">
                  <h3>Ваши данные</h3>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Имя"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <div className="donation-section">
               
                <div className="payment-options">

                </div>
              </div>

              <Button 
                type="submit" 
                className="donation-submit"
                disabled={submitting}
              >
                {submitting ? 'Обработка...' : 'Перейти к оплате'}
              </Button>
            </Form>
          </div>

          <footer className="page-footer">
            <div className="footer-column">
              <p><strong>БЛАГОТВОРИТЕЛЬНЫЙ ФОНД</strong><br />
                СБЕРЕЖЕНИЯ КУЛЬТУРНЫХ И ДУХОВНЫХ ЦЕННОСТЕЙ «НАСЛЕДИЕ НАЦИИ»</p>
              <p>РАСЧЕТНЫЙ СЧЕТ 40 703 810 467 100 000 256<br />
                В ЗАПАДНО-СИБИРСКОМ БАНКЕ ПАО СБЕРБАНК Г. ТЮМЕНЬ</p>
            </div>
            <div className="footer-column">
              <p>ФАКТИЧЕСКИЙ АДРЕС: 101000, Г.МОСКВА, УЛ. МЯСНИЦКАЯ 47, ОФИС 532<br />
                ИРИНА ЛЕПИХИНА, ПРЕЗИДЕНТ<br />
                КОР/СЧЕТ 30 101 810 800 000 000 000<br />
                БИК 047 102 651<br />
                ОГРН 1 187 232 029 181<br />
                ИНН/КПП 7 203 463 423/720301001</p>
            </div>
            <div className="footer-column">
              <p>ЮРИДИЧЕСКИЙ АДРЕС: 625049, Г. ТЮМЕНЬ, УЛ. ТИМИРЯЗЕВА, 125<br />
                ТЕЛ. +79851929014, E-MAIL: NASLEDIE@NATCII.RU</p>
              <p>
                <a href="#">ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ</a> | 
                <a href="#">ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ</a> | 
                <a href="#">ДОГОВОР ОФЕРТЫ</a> | 
                <a href="#">О НАС</a> | 
                <a href="#">ОТЧЁТЫ</a>
              </p>
            </div>
          </footer>
        </div>
      </Container>

      <Modal show={showQR} onHide={() => setShowQR(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>QR Код для оплаты</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img 
            src="http://localhost:9000/data/qr.jpeg" 
            alt="QR Code" 
            className="img-fluid"
            style={{ maxWidth: '400px' }}
          />
          <p className="mt-3">Отсканируйте QR код для завершения платежа</p>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Donate;