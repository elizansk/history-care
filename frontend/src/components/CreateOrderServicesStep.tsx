import { Card, Form, Stack, Row, Col, Button } from "react-bootstrap";

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
  services: Service[];
  selectedServices: SelectedService[];
  serviceDescriptions: Record<number, string>;
  onAddService: (serviceId: number) => void;
  onRemoveService: (serviceId: number) => void;
  onPriceChange: (serviceId: number, price: number) => void;
  onDescriptionChange: (serviceId: number, description: string) => void;
}

export default function CreateOrderServicesStep({
  services,
  selectedServices,
  serviceDescriptions,
  onAddService,
  onRemoveService,
  onPriceChange,
  onDescriptionChange,
}: Props) {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3 text-success">Шаг 2: Добавление услуг реконструкции</Card.Title>
        <Stack gap={3}>
          <Form.Group controlId="serviceSelect">
            <Form.Label>Добавить услугу</Form.Label>
            <Form.Select
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value) {
                  onAddService(value);
                }
              }}
            >
              <option value="">Добавить услугу</option>
              {services
                .filter((s) => !selectedServices.find((ss) => ss.id === s.id))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {s.price} ₽
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          <Stack gap={3}>
            {selectedServices.map((s) => {
              const service = services.find((x) => x.id === s.id);
              return (
                <Card bg="light" key={s.id} className="shadow-sm">
                  <Card.Body>
                    <Row className="align-items-center gy-3">
                      <Col md={8}>
                        <div className="fw-semibold">{service?.name}</div>
                        <div className="text-muted">Стоимость: {s.price} ₽</div>
                      </Col>

                      <Col md={4} className="d-flex align-items-center gap-2">
                        <Form.Control
                          type="number"
                          min={1}
                          value={s.price}
                          onChange={(e) => onPriceChange(s.id, Number(e.target.value))}
                        />
                        <Button variant="danger" onClick={() => onRemoveService(s.id)}>
                          ✕
                        </Button>
                      </Col>

                      <Col>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="Описание услуги (опционально)"
                          value={serviceDescriptions[s.id] || ""}
                          onChange={(e) => onDescriptionChange(s.id, e.target.value)}
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              );
            })}
          </Stack>
        </Stack>
      </Card.Body>
    </Card>
  );
}
