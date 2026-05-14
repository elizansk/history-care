import { Card, Stack } from "react-bootstrap";

interface Service {
  id: number;
  name: string;
  price: number;
}

interface SelectedService {
  id: number;
  price: number;
  description: string;
  quantity: number;
}

interface Props {
  name: string;
  address: string;
  categoryName?: string;
  cityName?: string;
  filesCount: number;
  total: number;
  orderDescription: string;
  selectedServices: SelectedService[];
  services: Service[];
  serviceDescriptions: Record<number, string>;
}

export default function CreateOrderSummaryStep({
  name,
  address,
  categoryName,
  cityName,
  filesCount,
  total,
  orderDescription,
  selectedServices,
  services,
  serviceDescriptions,
}: Props) {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3 text-success">Шаг 3: Формирование заявки</Card.Title>
        <Stack gap={3}>
          <Card bg="light">
            <Card.Body>
              <Card.Subtitle className="mb-3">Здание</Card.Subtitle>
              <p>
                <strong>Название:</strong> {name}
              </p>
              <p>
                <strong>Адрес:</strong> {address}
              </p>
              <p>
                <strong>Категория:</strong> {categoryName}
              </p>
              {cityName && (
                <p>
                  <strong>Город:</strong> {cityName}
                </p>
              )}
              <p>
                <strong>Файлов:</strong> {filesCount}
              </p>
            </Card.Body>
          </Card>

          <Card bg="light">
            <Card.Body>
              <Card.Subtitle className="mb-3">Заявка</Card.Subtitle>
              <p>
                <strong>Сумма сбора:</strong> {total.toLocaleString()} ₽
              </p>
              {orderDescription && (
                <p>
                  <strong>Описание:</strong> {orderDescription}
                </p>
              )}
            </Card.Body>
          </Card>

          <Card bg="light">
            <Card.Body>
              <Card.Subtitle className="mb-3">Услуги</Card.Subtitle>
              {selectedServices.length === 0 ? (
                <p>Услуги не выбраны</p>
              ) : (
                <Stack gap={3}>
                  {selectedServices.map((s) => {
                    const service = services.find((x) => x.id === s.id);
                    return (
                      <div key={s.id} className="border-bottom pb-3">
                        <div className="fw-semibold">
                          {service?.name}: {s.price.toLocaleString()} ₽
                        </div>
                        {serviceDescriptions[s.id] && (
                          <div className="text-muted mt-2">{serviceDescriptions[s.id]}</div>
                        )}
                      </div>
                    );
                  })}
                </Stack>
              )}
            </Card.Body>
          </Card>
        </Stack>
      </Card.Body>
    </Card>
  );
}
