import { useEffect, useState } from "react";
import axios from "axios";
import NavigationBar from "../components/NavigationBar";
import Footer from "../components/Footer";
import { getUser } from "../utils/auth";

interface Service {
  id: number;
  name: string;
  price: number;
}

interface Category {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
}

interface Building {
  id: number;
  name: string;
  description: string;
  address: string;
  category_id: number;
  city_id: number;
}

export default function CreateOrder() {
  const token = localStorage.getItem("token");

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const [selectedServices, setSelectedServices] = useState<
    { id: number; quantity: number; price: number; description: string }[]
  >([]);

  // Building data
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [cityId, setCityId] = useState<number | "">("");
  const [files, setFiles] = useState<File[]>([]);

  // Building ID (after creation)
  const [buildingId, setBuildingId] = useState<number | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);

  // Order data
  const [orderId, setOrderId] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [orderDescription, setOrderDescription] = useState("");

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // User data
  const [user, setUser] = useState<any>(null);

  // Service descriptions (for step 3)
  const [serviceDescriptions, setServiceDescriptions] = useState<Record<number, string>>({});

  const cacheKey = "categories";
  const cacheTimeKey = "categories_time";
  const citiesCacheKey = "cities";
  const citiesCacheTimeKey = "cities_time";
  const TTL = 60 * 1000;

  // Load from sessionStorage on mount
  useEffect(() => {
    const savedBuildingId = sessionStorage.getItem("buildingId");
    const savedOrderId = sessionStorage.getItem("orderId");
    const savedBuildingData = sessionStorage.getItem("buildingData");
    const savedName = sessionStorage.getItem("buildingName");
    const savedDescription = sessionStorage.getItem("buildingDescription");
    const savedAddress = sessionStorage.getItem("buildingAddress");
    const savedCategoryId = sessionStorage.getItem("buildingCategoryId");
    const savedCityId = sessionStorage.getItem("buildingCityId");
    const savedTotal = sessionStorage.getItem("orderTotal");
    const savedOrderDescription = sessionStorage.getItem("orderDescription");
    const savedSelectedServices = sessionStorage.getItem("selectedServices");

    if (savedBuildingId) setBuildingId(Number(savedBuildingId));
    if (savedOrderId) setOrderId(Number(savedOrderId));
    if (savedBuildingData) setBuilding(JSON.parse(savedBuildingData));
    if (savedName) setName(savedName);
    if (savedDescription) setDescription(savedDescription);
    if (savedAddress) setAddress(savedAddress);
    if (savedCategoryId) setCategoryId(Number(savedCategoryId));
    if (savedCityId) setCityId(Number(savedCityId));
    if (savedTotal) setTotal(Number(savedTotal));
    if (savedOrderDescription) setOrderDescription(savedOrderDescription);
    if (savedSelectedServices) setSelectedServices(JSON.parse(savedSelectedServices));
  }, []);

  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'City') {
        setCityId(user.city_id);
      }
    }
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // SERVICES
    axios
      .get("/api/services", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setServices(res.data);
        }
      });

    // CATEGORIES (cache)
    const cached = sessionStorage.getItem(cacheKey);
    const cachedTime = sessionStorage.getItem(cacheTimeKey);

    if (cached && cachedTime && Date.now() - Number(cachedTime) < TTL) {
      setCategories(JSON.parse(cached));
    } else {
      axios
        .get("/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setCategories(res.data);
          sessionStorage.setItem(cacheKey, JSON.stringify(res.data));
          sessionStorage.setItem(cacheTimeKey, String(Date.now()));
        });
    }

    // CITIES (cache)
    const citiesCached = sessionStorage.getItem(citiesCacheKey);
    const citiesCachedTime = sessionStorage.getItem(citiesCacheTimeKey);

    if (citiesCached && citiesCachedTime && Date.now() - Number(citiesCachedTime) < TTL) {
      setCities(JSON.parse(citiesCached));
    } else {
      axios
        .get("/api/auth/cities", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setCities(res.data);
          sessionStorage.setItem(citiesCacheKey, JSON.stringify(res.data));
          sessionStorage.setItem(citiesCacheTimeKey, String(Date.now()));
        });
    }
  }, []);

  // Save to sessionStorage whenever data changes
  useEffect(() => {
    sessionStorage.setItem("buildingName", name);
    sessionStorage.setItem("buildingDescription", description);
    sessionStorage.setItem("buildingAddress", address);
    sessionStorage.setItem("buildingCategoryId", String(categoryId));
    sessionStorage.setItem("buildingCityId", String(cityId));
    sessionStorage.setItem("orderTotal", String(total));
    sessionStorage.setItem("orderDescription", orderDescription);
    sessionStorage.setItem("selectedServices", JSON.stringify(selectedServices));
    if (buildingId) sessionStorage.setItem("buildingId", String(buildingId));
    if (orderId) sessionStorage.setItem("orderId", String(orderId));
    if (building) sessionStorage.setItem("buildingData", JSON.stringify(building));
  }, [name, description, address, categoryId, cityId, total, orderDescription, selectedServices, buildingId, orderId, building]);

  const createOrUpdateBuilding = async () => {
    if (!name.trim() || !description.trim() || !address.trim() || !categoryId || (user?.role === 'Admin' && !cityId)) {
      alert("Пожалуйста, заполните все обязательные поля для здания.");
      return false;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("address", address);
    formData.append("category_id", String(categoryId));
    formData.append("city_id", String(cityId));

    files.forEach((f) => formData.append("files", f));

    try {
      let res;
      if (buildingId) {
        // Update building
        res = await axios.put(`/api/buildings/${buildingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create new building
        res = await axios.post("/api/buildings", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBuildingId(res.data.id);
      }

      setBuilding(res.data);
      return true;
    } catch (err) {
      console.error(err);
      alert("Ошибка при создании/обновлении здания");
      return false;
    }
  };

  const createOrderDraft = async () => {
    try {
      const res = await axios.post("/api/orders/draft", {
        building_id: buildingId,
        total_amount: total,
        description: orderDescription,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrderId(res.data.id);
      return true;
    } catch (err) {
      console.error(err);
      alert("Ошибка при создании черновика заявки");
      return false;
    }
  };

  const addServicesToOrder = async () => {
    if (selectedServices.length === 0) {
      alert("Пожалуйста, добавьте хотя бы одну услугу");
      return false;
    }

    try {
      const servicesData = selectedServices.map(s => ({
        service_id: s.id,
        quantity: s.quantity,
        price: s.price,
        description: serviceDescriptions[s.id] || ""
      }));

      await axios.post(`/api/orders/${orderId}/services`, 
        { services: servicesData },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return true;
    } catch (err) {
      console.error(err);
      alert("Ошибка при добавлении услуг");
      return false;
    }
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      const success = await createOrUpdateBuilding();
      if (!success) return;
    } else if (currentStep === 2) {
      const success = await createOrderDraft();
      if (!success) return;
    } else if (currentStep === 3) {
      const success = await addServicesToOrder();
      if (!success) return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Final order creation
      const res = await axios.post("/api/orders", {
        order_id: orderId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Заявка создана! ID: " + res.data.id);
      
      // Clear sessionStorage
      sessionStorage.removeItem("buildingId");
      sessionStorage.removeItem("orderId");
      sessionStorage.removeItem("buildingData");
      sessionStorage.removeItem("buildingName");
      sessionStorage.removeItem("buildingDescription");
      sessionStorage.removeItem("buildingAddress");
      sessionStorage.removeItem("buildingCategoryId");
      sessionStorage.removeItem("buildingCityId");
      sessionStorage.removeItem("orderTotal");
      sessionStorage.removeItem("orderDescription");
      sessionStorage.removeItem("selectedServices");

      // Reset form
      setName("");
      setDescription("");
      setAddress("");
      setCategoryId("");
      setCityId(user?.role === 'City' ? user.city_id : "");
      setFiles([]);
      setTotal(0);
      setOrderDescription("");
      setSelectedServices([]);
      setBuildingId(null);
      setOrderId(null);
      setBuilding(null);
      setCurrentStep(1);
    } catch (err) {
      console.error(err);
      alert("Ошибка при создании заявки");
    }
  };

  return (
    <>
      <NavigationBar />
      <div className="container" style={{ paddingTop: "20px", paddingBottom: "40px" }}>
        <h1 className="search-title">Создание заявки</h1>

        {/* Progress Bar */}
        <div style={{ marginBottom: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i + 1}
                style={{
                  flex: 1,
                  height: "6px",
                  background: currentStep > i ? "var(--primary)" : "#e0e0e0",
                  margin: "0 2px",
                  borderRadius: "3px",
                  transition: "background 0.3s ease",
                }}
              />
            ))}
          </div>
          <div style={{ textAlign: "center", fontSize: "14px", color: "var(--text-muted)" }}>
            Шаг {currentStep} из {totalSteps}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Building Creation */}
          {currentStep === 1 && (
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "20px",
                boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
                maxWidth: "800px",
                margin: "0 auto",
              }}
            >
              <h2 style={{ fontSize: "24px", color: "var(--primary)", marginBottom: "20px" }}>
                Шаг 1: Создание здания
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <input
                  placeholder="Название здания"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                  required
                />

                <textarea
                  placeholder="Описание здания"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", resize: "vertical" }}
                  required
                />

                <input
                  placeholder="Адрес"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                  required
                />

                <div style={{ display: "flex", gap: "10px" }}>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
                    style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                    required
                  >
                    <option value="">Категория</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {user?.role === 'Admin' ? (
                    <select
                      value={cityId}
                      onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : "")}
                      style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                      required
                    >
                      <option value="">Город</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>

                <div>
                  <label style={{ fontSize: "14px", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                    Фото и видео здания
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))}
                    style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "8px" }}
                  />
                  {files.length > 0 && (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                      Выбрано файлов: {files.length}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Order Draft */}
          {currentStep === 2 && (
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "20px",
                boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
                maxWidth: "800px",
                margin: "0 auto",
              }}
            >
              <h2 style={{ fontSize: "24px", color: "var(--primary)", marginBottom: "20px" }}>
                Шаг 2: Информация о здании
              </h2>

              {building && (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "30px" }}>
                  <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "12px" }}>
                    <p><strong>Название:</strong> {building.name}</p>
                    <p><strong>Адрес:</strong> {building.address}</p>
                    <p><strong>Описание:</strong> {building.description}</p>
                    <p><strong>Категория:</strong> {categories.find(c => c.id === building.category_id)?.name}</p>
                    {user.role === 'Admin' && (
                      <p><strong>Город:</strong> {cities.find(c => c.id === building.city_id)?.name}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Services */}
          {currentStep === 3 && (
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "20px",
                boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
                maxWidth: "800px",
                margin: "0 auto",
              }}
            >
              <h2 style={{ fontSize: "24px", color: "var(--primary)", marginBottom: "20px" }}>
                Шаг 3: Добавление услуг реконструкции
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <select
                    onChange={(e) => {
                      const service = services.find((s) => s.id === Number(e.target.value));
                      if (!service) return;

                      if (!selectedServices.find((s) => s.id === service.id)) {
                        setSelectedServices((prev) => [
                          ...prev,
                          { id: service.id, quantity: 1, price: service.price, description: "" },
                        ]);
                      }
                    }}
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                  >
                    <option value="">Добавить услугу</option>
                    {services
                      .filter((s) => !selectedServices.find((ss) => ss.id === s.id))
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} - {s.price} ₽
                        </option>
                      ))}
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedServices.map((s) => {
                    const service = services.find((x) => x.id === s.id);

                    return (
                      <div
                        key={s.id}
                        style={{
                          padding: "16px",
                          borderRadius: "12px",
                          background: "var(--accent)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "16px" }}>
                              {service?.name}
                            </div>
                            <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                              {s.price} ₽ за единицу
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <input
                              type="number"
                              min={1}
                              value={s.quantity}
                              onChange={(e) => {
                                const qty = Number(e.target.value);
                                setSelectedServices((prev) =>
                                  prev.map((x) => (x.id === s.id ? { ...x, quantity: qty } : x))
                                );
                              }}
                              style={{ width: "60px", padding: "4px", borderRadius: "4px", border: "1px solid #ddd" }}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedServices((prev) => prev.filter((x) => x.id !== s.id))
                              }
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "none",
                                background: "#dc3545",
                                color: "white",
                                cursor: "pointer",
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        <textarea
                          placeholder="Описание услуги (опционально)"
                          value={serviceDescriptions[s.id] || ""}
                          onChange={(e) =>
                            setServiceDescriptions((prev) => ({
                              ...prev,
                              [s.id]: e.target.value,
                            }))
                          }
                          rows={2}
                          style={{
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ddd",
                            fontSize: "14px",
                            resize: "vertical",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Finalization */}
          {currentStep === 4 && (
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "20px",
                boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
                maxWidth: "800px",
                margin: "0 auto",
              }}
            >
              <h2 style={{ fontSize: "24px", color: "var(--primary)", marginBottom: "20px" }}>
                Шаг 4: Формирование заявки
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "12px" }}>
                  <h3 style={{ marginBottom: "15px", fontSize: "18px" }}>Здание</h3>
                  <p><strong>Название:</strong> {name}</p>
                  <p><strong>Адрес:</strong> {address}</p>
                  <p><strong>Категория:</strong> {categories.find(c => c.id === categoryId)?.name}</p>
                  <p><strong>Город:</strong> {cities.find(c => c.id === cityId)?.name}</p>
                  <p><strong>Файлов:</strong> {files.length}</p>
                </div>

                <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "12px" }}>
                  <h3 style={{ marginBottom: "15px", fontSize: "18px" }}>Заявка</h3>
                  <p><strong>Цель сбора:</strong> {total.toLocaleString()} ₽</p>
                  {orderDescription && <p><strong>Описание:</strong> {orderDescription}</p>}
                </div>

                <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "12px" }}>
                  <h3 style={{ marginBottom: "15px", fontSize: "18px" }}>Услуги</h3>
                  {selectedServices.length === 0 ? (
                    <p>Услуги не выбраны</p>
                  ) : (
                    selectedServices.map((s) => {
                      const service = services.find((x) => x.id === s.id);
                      return (
                        <div key={s.id} style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #ddd" }}>
                          <div style={{ fontWeight: 600 }}>
                            {service?.name} x{s.quantity} = {(s.price * s.quantity).toLocaleString()} ₽
                          </div>
                          {serviceDescriptions[s.id] && (
                            <div style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                              {serviceDescriptions[s.id]}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              maxWidth: "800px",
              margin: "30px auto 0",
            }}
          >
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                background: currentStep === 1 ? "#f8f9fa" : "white",
                color: currentStep === 1 ? "#6c757d" : "var(--text)",
                cursor: currentStep === 1 ? "not-allowed" : "pointer",
              }}
            >
              Назад
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  background: "var(--primary)",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Далее
              </button>
            ) : (
              <button
                type="submit"
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  background: "var(--primary)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Создать заявку
              </button>
            )}
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};