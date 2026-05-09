import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Form, Button, Container, Card, Alert, Spinner } from "react-bootstrap";
import { createBuilding } from "../api/buildings";
import { createDraftOrder } from "../api/orders";
import type { CreateBuildingForm } from "../types/building";

export default function CreateBuildingPage() {
  const [form, setForm] = useState<CreateBuildingForm>({
    name: "",
    description: "",
    address: "",
    category_id: 0,
    city_id: undefined,
  });

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<any>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "category_id" || name === "city_id"
        ? value ? Number(value) : undefined
        : value,
    }));
  };

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      // 1. building form-data
      const fd = new FormData();

      fd.append("name", form.name);
      fd.append("address", form.address);
      fd.append("category_id", String(form.category_id));

      if (form.description) {
        fd.append("description", form.description);
      }

      if (form.city_id) {
        fd.append("city_id", String(form.city_id));
      }

      files.forEach((file) => {
        fd.append("files", file);
      });

      // 2. create building
      const building = await createBuilding(fd);

      const buildingId = building.ID ?? building.id;

      if (!buildingId) {
        throw new Error("Building ID not returned from server");
      }

      // 3. create draft order
      const order = await createDraftOrder(buildingId);

      setSuccess({ building, order });

      setForm({
        name: "",
        description: "",
        address: "",
        category_id: 0,
        city_id: undefined,
      });

      setFiles([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ maxWidth: 850, marginTop: 40 }}>
      <Card className="p-4 shadow-sm">
        <h3 style={{ color: "var(--primary)" }}>
          Заявка на реконструкцию здания
        </h3>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && (
          <Alert variant="success">
            Здание и черновик заявки успешно созданы
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Название *</Form.Label>
            <Form.Control
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Описание</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Адрес *</Form.Label>
            <Form.Control
              name="address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category ID *</Form.Label>
            <Form.Control
              type="number"
              name="category_id"
              value={form.category_id || ""}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>City ID (admin only)</Form.Label>
            <Form.Control
              type="number"
              name="city_id"
              value={form.city_id ?? ""}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Файлы (фото / видео)</Form.Label>
            <Form.Control
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFiles}
            />
          </Form.Group>

          <Button
            type="submit"
            style={{ background: "var(--primary)", border: "none" }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" /> Отправка...
              </>
            ) : (
              "Создать заявку"
            )}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}