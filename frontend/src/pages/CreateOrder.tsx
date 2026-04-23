import { useEffect, useState } from "react";
import axios from "axios";

interface Service {
  id: number;
  name: string;
  price: number;
}

interface Category {
  id: number;
  name: string;
}

export default function  CreateOrder ()  {

  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);


  const [selectedServices, setSelectedServices] = useState<
    { id: number; quantity: number; price: number }[]
  >([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");


  const [files, setFiles] = useState<File[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {

    const token = localStorage.getItem("token");
       if (!token) return;
    axios.get(`${API_URL}/services`, {
        headers: { Authorization: `Bearer ${token}` }
                 })
      .then(res => Array.isArray(res.data) && setServices(res.data));

    axios.get(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
                 })
      .then(res => Array.isArray(res.data) && setCategories(res.data));

  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("address", address);
    formData.append("category_id", String(categoryId));
    formData.append("total_amount", String(total));

    selectedServices.forEach(s => {
      formData.append("service_ids", String(s.id));
      formData.append("quantities", String(s.quantity));
    });

    files.forEach(f => formData.append("files", f));

    try {
      const res = await axios.post(`${API_URL}/orders`,
        formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          },
      );
      alert("Заявка создана! ID: " + res.data.order_id);
    } catch (err) {
      console.error(err);
      alert("Ошибка");
    }
  };

  return (
    <div className="container">
      <h1 className="search-title">Создание заявки</h1>

      <form onSubmit={handleSubmit} style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "30px",
        alignItems: "start"
      }}>

        {/* LEFT CARD */}
        <div style={{
          background: "white",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "18px"
        }}>

          <h2 style={{ fontSize: "20px", color: "var(--primary)" }}>Основная информация</h2>

          <input placeholder="Название"
            value={name}
            onChange={e => setName(e.target.value)} />

          <input placeholder="Описание"
            value={description}
            onChange={e => setDescription(e.target.value)} />

          <input placeholder="Адрес"
            value={address}
            onChange={e => setAddress(e.target.value)} />

          <div style={{ display: "flex", gap: "10px" }}>
            <select value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Категория</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "14px", color: "var(--text-muted)" }}>Фото</label>
            <input type="file" multiple
              onChange={e => e.target.files && setFiles(Array.from(e.target.files))}
            />
          </div>

        </div>

        {/* RIGHT PANEL */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* SERVICES */}
          <div style={{
            background: "white",
            padding: "20px",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
          }}>
            <h3 style={{ marginBottom: "10px" }}>Услуги</h3>

            <select
              onChange={(e) => {
                const service = services.find(s => s.id === Number(e.target.value));
                if (!service) return;

                if (!selectedServices.find(s => s.id === service.id)) {
                  setSelectedServices(prev => [
                    ...prev,
                    { id: service.id, quantity: 1, price: service.price }
                  ]);
                }
              }}
            >
              <option value="">Добавить услугу</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {selectedServices.map(s => {
                const service = services.find(x => x.id === s.id);
                return (
                  <div key={s.id} style={{
                    padding: "12px",
                    borderRadius: "14px",
                    background: "var(--accent)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{service?.name}</div>
                      <div style={{ fontSize: "12px" }}>{s.price} ₽</div>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <input type="number" min={1} value={s.quantity}
                        onChange={(e) => {
                          const qty = Number(e.target.value);
                          setSelectedServices(prev =>
                            prev.map(x => x.id === s.id ? { ...x, quantity: qty } : x)
                          );
                        }}
                      />

                      <button type="button"
                        onClick={() => setSelectedServices(prev => prev.filter(x => x.id !== s.id))}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TOTAL */}
          <div style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
            color: "white",
            padding: "20px",
            borderRadius: "20px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.2)"
          }}>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>Сумма заявки</div>
            <input
              type="number"
              value={total}
              onChange={(e) => setTotal(Number(e.target.value))}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                fontSize: "18px"
              }}
            />
          </div>

          <button type="submit" style={{
            padding: "16px",
            borderRadius: "16px",
            background: "var(--primary)",
            color: "white",
            fontSize: "16px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer"
          }}>
            Создать заявку
          </button>

        </div>

      </form>
    </div>
  );
};

