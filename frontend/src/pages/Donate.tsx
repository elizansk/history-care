import React, { useState, useEffect } from 'react';
import { Container, Alert, Form, Button, ProgressBar, Modal } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Breadcrumbs from '../components/Breadcrumbs';
import { getFormedOrders, getOrderById } from '../api/orders';
import { submitDonation } from '../api/donations';
import { getUser } from '../utils/auth';
import type { MockOrder } from '../api/orders';

let embedderPromise: any = null;//Хранит загруженную AI модель

const Donate: React.FC = () => {//создаем реакт компонент
  const { id } = useParams<{ id: string }>();//берём id из URL
  const [order, setOrder] = useState<MockOrder | null>(null);//текущая заявка
  const [loading, setLoading] = useState(true);//идет ли загрузка
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [similarOrders, setSimilarOrders] = useState<MockOrder[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState<string | null>(null);
  const [formData, setFormData] = useState({//формат доната
    amount: '',
    customAmount: '',
    name: '',
    email: '',
    payment: '',
  });

  useEffect(() => {//загрузка пользователя, читает JWT,кладёт пользователя в state
    setUser(getUser());
  }, []);

  useEffect(() => {//загрузка заявки если нет id - ничего не делаем
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(parseInt(id));//берем заявку с сервера и сохраняем в state
        setOrder(data);
      } catch  {
        setError('Не удалось загрузить данные объекта');
      } finally {
        setLoading(false);//выключаем loading
      }
    };
    fetchOrder();
  }, [id]);

  if (loading && id) return <div className="text-center p-5">Загрузка...</div>;//если грузится показываем загрузку
  if (error && id) return <Alert variant="danger">{error}</Alert>;//ошибка отображ

  const mainPhoto = order?.building.resources.find(r => r.resource_type === 'photo' && r.is_main);

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Исторические здания', href: '/buildings' },
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

  const getText = (source: MockOrder) => source.building.description?.trim() || source.building.name || '';

  const cosineSimilarity = (a: number[], b: number[]) => {//1.0 → полностью похожи,0.0 → не похожи ,-1.0 → противоположны
    const dot = a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
    const normA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
    const normB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
    return normA === 0 || normB === 0 ? 0 : dot / (normA * normB);
  };

  const flattenEmbedding = (value: any): number[] => {
    if (!Array.isArray(value)) return [];
    if (typeof value[0] === 'number') return value as number[];
    return (value as any[]).flat(Infinity).filter((item: any) => typeof item === 'number');
  };

  const loadSimilarOrders = async () => {
    setSimilarLoading(true);
    setSimilarError(null);
    setSimilarOrders([]);//Похожие заявки

    let candidates: MockOrder[] = [];
    try {
      const allOrders = await getFormedOrders();//получаем все услуги
      candidates = allOrders.filter((item) => item.id !== order?.id);

      if (candidates.length === 0) {
        setSimilarOrders([]);
        setSimilarError(null);
        return;
      }

      const texts = [order?.building.description || order?.building.name || '', ...candidates.map(getText)];//текст для сравненния
      let embedder: any;
      if (!embedderPromise) {
        embedderPromise = import('@xenova/transformers').then(({ pipeline }) =>//библиотека, которая запускает ML модель прямо в браузере
          pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')//готовая NLP модель,которая умеет понимать смысл текста,оптимизирована для поиска похожих предложений
        );
      }
       embedder = await embedderPromise;

      const rawEmbedding: any = await embedder(texts);//texts = массив описаний
      const embeddings = Array.isArray(rawEmbedding)
        ? rawEmbedding.map(flattenEmbedding).filter((vec) => vec.length > 0)//приводим к нормальному виду
        : [];

      if (embeddings.length <= 1) {
        throw new Error('Embedding generation failed');
      }

      const baseEmbedding = embeddings[0];//это текущая услуга
      const similar = candidates
        .map((candidate, index) => ({
          order: candidate,
          score: cosineSimilarity(baseEmbedding, embeddings[index + 1] || []),//считаем схожесть
        }))
        .sort((a, b) => b.score - a.score)//сортируем в топ 3 по схожести
        .slice(0, 3)
        .map((item) => item.order);

      if (similar.length > 0) {
        setSimilarOrders(similar);
      } else {
        setSimilarOrders(
          candidates
            .filter(
              (candidate) =>
                candidate.building.category_id === order?.building.category_id ||
                candidate.building.city_id === order?.building.city_id
            )
            .slice(0, 3)
        );
      }
    } catch (err) {
      console.warn('Не удалось загрузить похожие заявки:', err);
      const fallback = candidates
        .filter(
          (candidate) =>
            candidate.building.category_id === order?.building.category_id ||
            candidate.building.city_id === order?.building.city_id
        )
        .slice(0, 3);
      setSimilarOrders(fallback);
      setSimilarError(fallback.length === 0 ? 'Не удалось загрузить похожие заявки' : null);
    } finally {
      setSimilarLoading(false);
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
      loadSimilarOrders();
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
              <img className="building-media building-image" src={mainPhoto.url} alt={order?.building.name} />
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

          <section className="similar-section mt-4 text-start">
            <h5>Похожие заявки</h5>
            {similarLoading && <p>Ищем похожие заявки...</p>}
            {!similarLoading && similarError && similarOrders.length === 0 && (
              <Alert variant="warning">{similarError}</Alert>
            )}
            {!similarLoading && similarOrders.length === 0 && !similarError && (
              <p>Похожих заявок не найдено.</p>
            )}
            <div className="similar-grid">
              {similarOrders.map((similar) => {
                const media =
                  similar.building.resources.find((r) => r.resource_type === 'photo' && r.is_main) ||
                  similar.building.resources.find((r) => r.resource_type === 'video' && r.is_main);
                const isVideo = media?.resource_type === 'video';
                return (
                  <article className="similar-card" key={similar.id}>
                    {media && !isVideo && (
                      <img
                        src={media.url}
                        alt={similar.building.name}
                        className="similar-card-image"
                      />
                    )}
                    {media && isVideo && (
                      <div className="video-thumbnail similar-card-image">
                        <video src={media.url} />
                        <span className="play-icon">▶</span>
                      </div>
                    )}
                    <div className="similar-card-body">
                      <h4>{similar.building.name}</h4>
                      <p>
                        {similar.building.description?.slice(0, 120)}
                        {similar.building.description && similar.building.description.length > 120 ? '...' : ''}
                      </p>
                      <div className="similar-card-meta">
                        <span>{similar.building.city.name}</span>
                        <span>{similar.building.category.name}</span>
                      </div>
                      <Link to={`/building/${similar.id}`} className="btn btn-outline-primary btn-sm">
                        Открыть
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Donate;