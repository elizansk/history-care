import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import NavigationBar from "../components/NavigationBar";
import Footer from "../components/Footer";
import { getUser } from "../utils/auth";
import { Button, Card, Container, Form, ProgressBar, Spinner, Alert } from "react-bootstrap";
import type { RootState, AppDispatch } from "../store";
import {//асинхронные операции
  fetchCategories,
  fetchCities,
  fetchServices,
  createBuilding,
  updateBuilding,
  createOrderDraft,
  fetchDraftOrder,
  deleteDraftService,
  addServicesToOrder,
  FormOrder,
  clearError,
  resetOrder,
} from "../store/order-slice";
import CreateOrderBuildingStep from "../components/CreateOrderBuildingStep";//разбиваем создание заявки на 3 компонента
import CreateOrderServicesStep from "../components/CreateOrderServicesStep";
import CreateOrderSummaryStep from "../components/CreateOrderSummaryStep";

export default function CreateOrder() {
  const dispatch = useDispatch<AppDispatch>();
  // Берем данные услуг и информацию о кэше из Redux.
  const { loading, error, categories, cities, services, servicesCacheInfo, building, order } = useSelector((state: RootState) => state.order);//берём данные из Redux store
  const token = localStorage.getItem("token");

  const [selectedServices, setSelectedServices] = useState< //локальная корзина услуг (ещё НЕ в Redux)
    { id: number; price: number; description: string; quantity: number }[]
  >([]);

  // форма здания хранится локально
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [cityId, setCityId] = useState<number | "">("");
  const [files, setFiles] = useState<File[]>([]);

  // Building ID (after creation)
  const [buildingId, setBuildingId] = useState<number | null>(null);
 // связывают frontend и backend сущности
  // Order data
  const [orderId, setOrderId] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [orderDescription, setOrderDescription] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftServiceIds, setDraftServiceIds] = useState<number[]>([]);

  // 3 шага заявки
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // User
  const [user, setUser] = useState<any>(null);

  // Service descriptions (for step 3)
  const [serviceDescriptions, setServiceDescriptions] = useState<Record<number, string>>({});
//при старте страницы грузим данные из backend
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchCities());
    dispatch(fetchServices());
  }, [dispatch]);
//если пользователь обновил страницу восстанавливаем форму продолжаем заявку
  useEffect(() => {
    const savedBuildingId = sessionStorage.getItem("buildingId");
    const savedOrderId = sessionStorage.getItem("orderId");
    const savedName = sessionStorage.getItem("buildingName");
    const savedDescription = sessionStorage.getItem("buildingDescription");
    const savedAddress = sessionStorage.getItem("buildingAddress");
    const savedCategoryId = sessionStorage.getItem("buildingCategoryId");
    const savedCityId = sessionStorage.getItem("buildingCityId");
    const savedTotal = sessionStorage.getItem("orderTotal");
    const savedOrderDescription = sessionStorage.getItem("orderDescription");
    const savedSelectedServices = sessionStorage.getItem("selectedServices");

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedBuildingId) setBuildingId(Number(savedBuildingId));
    if (savedOrderId) setOrderId(Number(savedOrderId));
    if (savedName) setName(savedName);
    if (savedDescription) setDescription(savedDescription);
    if (savedAddress) setAddress(savedAddress);
    if (savedCategoryId) setCategoryId(Number(savedCategoryId));
    if (savedCityId) setCityId(Number(savedCityId));
    if (savedTotal) setTotal(Number(savedTotal));
    if (savedOrderDescription) setOrderDescription(savedOrderDescription);
    if (savedSelectedServices) {
      const parsed = JSON.parse(savedSelectedServices);
      setSelectedServices(parsed.map((s: any) => ({ ...s, quantity: s.quantity || 1 })));
    }
  }, []);

  useEffect(() => {//получение пользователя
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getUser());
  }, []);

  useEffect(() => {//фикс города под сити
    if (user) {
      if (user.role === "City") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCityId(0);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!token || draftLoaded) {
      return;
    }

    const loadDraft = async () => {
      await dispatch(fetchDraftOrder());//проверяем есть ли уже черновик заявки
      setDraftLoaded(true);
      if (order && (order.order_id || order.id)) {
        setCurrentStep(2);
      } else {
        setCurrentStep(1);
      }
    };

    loadDraft();
  }, [token, draftLoaded, dispatch, order]);

  useEffect(() => {
    const computedTotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTotal(computedTotal);//сумма всех услуг
  }, [selectedServices]);

  useEffect(() => {//сохр в сесионстор
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

  const createOrUpdateBuilding = async (): Promise<number | false> => {//если buildingId есть - update,нет то create
    if (!name.trim() || !description.trim() || !address.trim() || !categoryId || (user?.role === "Admin" && !cityId)) {
      alert("Пожалуйста, заполните все обязательные поля для здания.");
      return false;
    }
    try {
      let result;
      if (buildingId) {
        result = await dispatch(updateBuilding({ id: buildingId, data: { name, description, address, category_id: Number(categoryId), city_id: Number(cityId), files } })).unwrap();
      } else {
        result = await dispatch(createBuilding({ name, description, address, category_id: Number(categoryId), city_id: Number(cityId), files })).unwrap();
        setBuildingId(result.id ?? null);
      }

      return result.id || buildingId || false;
    } catch (err) {
      console.error(err);
      alert("Ошибка при создании/обновлении здания");
      return false;
    }
  };

  const createDraftOrder = async (draftBuildingId: number | null = buildingId) => {//creat draft
    const targetBuildingId = draftBuildingId || buildingId;
    if (!targetBuildingId) {
      alert("Сначала создайте здание на шаге 1");
      return false;
    }
    try {
      const result = await dispatch(createOrderDraft(targetBuildingId)).unwrap();
      setOrderId((result as any).id || (result as any).order_id);
      return true;
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 400) {
        await dispatch(fetchDraftOrder());
        if (order && (order.order_id || order.id)) {
          return true;
        }
      }
      alert("Ошибка при создании черновика заявки");
      return false;
    }
  };

  const applyServicesToOrder = async () => {//синхронизация услуг удаляем старые добавляем новые обновляем backend
    if (!orderId) {
      alert("Сначала создайте черновик заявки");
      return false;
    }

    const currentServiceIds = selectedServices.map((s) => s.id);
    const deletedServiceIds = draftServiceIds.filter((id) => !currentServiceIds.includes(id));

    try {
      for (const serviceId of deletedServiceIds) {
        await dispatch(deleteDraftService(serviceId)).unwrap();
      }

      if (selectedServices.length === 0) {
        alert("Пожалуйста, добавьте хотя бы одну услугу");
        return false;
      }

      const servicesData = selectedServices.map((s) => ({
        service_id: s.id,
        price: s.price,
        description: serviceDescriptions[s.id] || "",
        quantity: 1,
      }));

      await dispatch(addServicesToOrder({ orderId, services: servicesData })).unwrap();

      setDraftServiceIds(currentServiceIds);
      return true;
    } catch (err) {
      console.error(err);
      alert("Ошибка при добавлении услуг");
      return false;
    }
  };

  const nextStep = async () => {//проверка для перехода между шагами
    if (currentStep === 1) {
      const buildingIdFromCreate = await createOrUpdateBuilding();
      if (!buildingIdFromCreate) return;

      const draftSuccess = await createDraftOrder(buildingIdFromCreate);
      if (!draftSuccess) return;
    } else if (currentStep === 2) {
      const success = await applyServicesToOrder();
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

  const handleSubmit = async (e: React.FormEvent) => {//отправляем заявку в статус сформирована
    e.preventDefault();

    try {
      const result = await dispatch(FormOrder({ orderId: orderId! })).unwrap();
      console.log(result);
      if (result.status === 'formed') {
        alert("Заявка создана! ID: " + orderId);
      }


      dispatch(resetOrder());
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

      setName("");
      setDescription("");
      setAddress("");
      setCategoryId("");
      setCityId(user?.role === "City" ? user.city_id : "");
      setFiles([]);
      setTotal(0);
      setOrderDescription("");
      setSelectedServices([]);
      setBuildingId(null);
      setOrderId(null);
      setCurrentStep(1);
      setDraftLoaded(false);
    } catch (err) {
      console.error(err);
      alert("Ошибка при создании заявки");
    }
  };

  return (
    <>
      <NavigationBar />
      <Container className="py-4">
        <h1 className="search-title mb-4">Создание заявки</h1>

        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <ProgressBar variant="success" now={(currentStep / totalSteps) * 100} />
            <div className="text-center text-muted mt-2">
              Шаг {currentStep} из {totalSteps}
            </div>
          </Card.Body>
        </Card>

        <Form onSubmit={handleSubmit}>
          {error && <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>{error}</Alert>}

          {currentStep === 1 && (
            <CreateOrderBuildingStep
              categories={categories}
              cities={cities}
              userRole={user?.role}
              name={name}
              description={description}
              address={address}
              categoryId={categoryId}
              cityId={cityId}
              files={files}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              onAddressChange={setAddress}
              onCategoryChange={setCategoryId}
              onCityChange={setCityId}
              onFilesChange={setFiles}
            />
          )}

          {currentStep === 2 && (
            <CreateOrderServicesStep
              services={services}
              // Передаем HIT/MISS в компонент выбора услуг.
              cacheInfo={servicesCacheInfo}
              selectedServices={selectedServices}
              serviceDescriptions={serviceDescriptions}
              onAddService={(serviceId) => {
                const service = services.find((s) => s.id === serviceId);
                if (!service) return;
                if (!selectedServices.find((s) => s.id === service.id)) {
                  setSelectedServices((prev) => [
                    ...prev,
                    { id: service.id, price: service.price, description: "", quantity: 1 },
                  ]);
                }
              }}
              onRemoveService={(serviceId) => {
                setSelectedServices((prev) => prev.filter((item) => item.id !== serviceId));
              }}
              onPriceChange={(serviceId, price) => {
                setSelectedServices((prev) =>
                  prev.map((item) => (item.id === serviceId ? { ...item, price } : item))
                );
              }}
              onDescriptionChange={(serviceId, description) => {
                setServiceDescriptions((prev) => ({
                  ...prev,
                  [serviceId]: description,
                }));
              }}
            />
          )}

          {currentStep === 3 && (
            <CreateOrderSummaryStep
              name={name}
              address={address}
              categoryName={categories.find((c) => c.id === categoryId)?.name}
              cityName={cities.find((c) => c.id === cityId)?.name}
              filesCount={files.length}
              total={total}
              orderDescription={orderDescription}
              selectedServices={selectedServices}
              services={services}
              serviceDescriptions={serviceDescriptions}
            />
          )}

          <div className="d-flex justify-content-between" style={{ maxWidth: 800, margin: "0 auto" }}>
            <Button variant="secondary" onClick={prevStep} disabled={currentStep === 1}>
              Назад
            </Button>
            {currentStep < totalSteps ? (
              <Button variant="success" type="button" onClick={nextStep} disabled={loading}>
                {loading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Загрузка...</> : "Далее"}
              </Button>
            ) : (
              <Button variant="success" type="submit" disabled={loading}>
                {loading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Создание...</> : "Создать заявку"}
              </Button>
            )}
          </div>
        </Form>
      </Container>
      <Footer />
    </>
  );
}
