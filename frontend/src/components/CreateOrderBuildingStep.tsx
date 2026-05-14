import { Card, Form, Stack, Row, Col } from "react-bootstrap";
import type { ChangeEvent } from "react";

interface Category {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
}

interface Props {
  categories: Category[];
  cities: City[];
  userRole?: string;
  name: string;
  description: string;
  address: string;
  categoryId: number | "";
  cityId: number | "";
  files: File[];
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onCategoryChange: (value: number | "") => void;
  onCityChange: (value: number | "") => void;
  onFilesChange: (files: File[]) => void;
}

export default function CreateOrderBuildingStep({
  categories,
  cities,
  userRole,
  name,
  description,
  address,
  categoryId,
  cityId,
  files,
  onNameChange,
  onDescriptionChange,
  onAddressChange,
  onCategoryChange,
  onCityChange,
  onFilesChange,
}: Props) {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3 text-success">Шаг 1: Создание здания</Card.Title>
        <Stack gap={3}>
          <Form.Group controlId="buildingName">
            <Form.Label>Название здания</Form.Label>
            <Form.Control
              type="text"
              placeholder="Название здания"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="buildingDescription">
            <Form.Label>Описание здания</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Описание здания"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="buildingAddress">
            <Form.Label>Адрес</Form.Label>
            <Form.Control
              type="text"
              placeholder="Адрес"
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              required
            />
          </Form.Group>

          <Row className="g-3">
            <Col md={userRole === "Admin" ? 6 : 12}>
              <Form.Group controlId="buildingCategory">
                <Form.Label>Категория</Form.Label>
                <Form.Select
                  value={categoryId}
                  onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : "")}
                  required
                >
                  <option value="">Категория</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {userRole === "Admin" && (
              <Col md={6}>
                <Form.Group controlId="buildingCity">
                  <Form.Label>Город</Form.Label>
                  <Form.Select
                    value={cityId}
                    onChange={(e) => onCityChange(e.target.value ? Number(e.target.value) : "")}
                    required
                  >
                    <option value="">Город</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
          </Row>

          <Form.Group controlId="buildingFiles">
            <Form.Label>Фото и видео здания</Form.Label>
            <Form.Control
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                e.target.files && onFilesChange(Array.from(e.target.files))
              }
            />
            {files.length > 0 && (
              <Form.Text className="text-muted">Выбрано файлов: {files.length}</Form.Text>
            )}
          </Form.Group>
        </Stack>
      </Card.Body>
    </Card>
  );
}
