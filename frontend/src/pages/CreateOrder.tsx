import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import NavigationBar from "../components/NavigationBar";
import Footer from "../components/Footer";
import { getUser, getUserRoleName } from "../utils/auth";
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
import '../resources/css/CreateOrder.css';

interface CreateOrderUser {
  role?: string | { name?: string };
  Role?: { name?: string };
  city_id?: number;
}

interface StoredSelectedService {
  id: number;
  price: number;
  description?: string;
  quantity?: number;
}

interface DraftOrderResponse {
  id?: number;
  order_id?: number;
  building_id?: number;
  building?: {
    id?: number;
    name?: string;
    description?: string;
    address?: string;
    category_id?: number;
    city_id?: number;
    resources?: {
      resource_type?: string;
      url?: string;
    }[];
  };
  services?: {
    service_id?: number;
    service?: {
      id?: number;
    };
    price?: number;
    description?: string;
    quantity?: number;
  }[];
  total_amount?: number;
  description?: string;
}

export default function CreateOrder() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, categories, cities, services, building } = useSelector((state: RootState) => state.order);//берём данные из Redux store
  const token = localStorage.getItem("token");

  const [selectedServices, setSelectedServices] = useState< //локальная корзина услуг (ещё НЕ в Redux)
    { id: number; price: number; description: string; quantity: number }[]
  >([]);

  // форма здания хранится локально
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDescriptionGenerating, setIsDescriptionGenerating] = useState(false);
  const [descriptionGenerationError, setDescriptionGenerationError] = useState<string | null>(null);
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
  const [hasExistingBuildingPhoto, setHasExistingBuildingPhoto] = useState(false);

  // 3 шага заявки
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // User
  const [user, setUser] = useState<CreateOrderUser | null>(null);
  const userRole = getUserRoleName(user);

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
    const savedBuildingData = sessionStorage.getItem("buildingData");

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
      const parsed = JSON.parse(savedSelectedServices) as StoredSelectedService[];
      setSelectedServices(parsed.map((s) => ({ ...s, description: s.description || "", quantity: s.quantity || 1 })));
    }
    if (savedBuildingData) {
      const parsedBuilding = JSON.parse(savedBuildingData) as DraftOrderResponse["building"];
      setHasExistingBuildingPhoto(Boolean(parsedBuilding?.resources?.some((resource) => resource.resource_type === "photo")));
    }
  }, []);

  useEffect(() => {//получение пользователя
    setUser(getUser());
  }, []);

  useEffect(() => {//фикс города под сити
    if (user) {
      if (userRole === "City" && user.city_id && !buildingId && !cityId) {
        setCityId(user.city_id);
      }
    }
  }, [user, userRole, buildingId, cityId]);

  const hydrateDraftOrder = (draft: DraftOrderResponse) => {
    const draftOrderId = draft.id || draft.order_id || null;
    const draftBuilding = draft.building;
    const draftBuildingId = draft.building_id || draftBuilding?.id || null;
    const restoredServices = (draft.services || [])
      .map((item) => {
        const serviceId = item.service_id || item.service?.id;
        if (!serviceId) return null;

        return {
          id: serviceId,
          price: Number(item.price || 0),
          description: item.description || "",
          quantity: item.quantity || 1,
        };
      })
      .filter((item): item is { id: number; price: number; description: string; quantity: number } => item !== null);
    const restoredDescriptions = restoredServices.reduce<Record<number, string>>((acc, service) => {
      acc[service.id] = service.description;
      return acc;
    }, {});

    if (draftOrderId) setOrderId(draftOrderId);
    if (draftBuildingId) setBuildingId(draftBuildingId);
    if (draftBuilding?.name) setName(draftBuilding.name);
    if (draftBuilding?.description) setDescription(draftBuilding.description);
    if (draftBuilding?.address) setAddress(draftBuilding.address);
    if (draftBuilding?.category_id) setCategoryId(draftBuilding.category_id);
    if (draftBuilding?.city_id) setCityId(draftBuilding.city_id);
    setHasExistingBuildingPhoto(Boolean(draftBuilding?.resources?.some((resource) => resource.resource_type === "photo")));

    setSelectedServices(restoredServices);
    setServiceDescriptions(restoredDescriptions);
    setDraftServiceIds(restoredServices.map((service) => service.id));
    setTotal(Number(draft.total_amount || restoredServices.reduce((sum, service) => sum + service.price, 0)));
    setOrderDescription(draft.description || "");

    if (draftOrderId) sessionStorage.setItem("orderId", String(draftOrderId));
    if (draftBuildingId) sessionStorage.setItem("buildingId", String(draftBuildingId));
    if (draftBuilding) {
      sessionStorage.setItem("buildingData", JSON.stringify(draftBuilding));
      sessionStorage.setItem("buildingName", draftBuilding.name || "");
      sessionStorage.setItem("buildingDescription", draftBuilding.description || "");
      sessionStorage.setItem("buildingAddress", draftBuilding.address || "");
      sessionStorage.setItem("buildingCategoryId", String(draftBuilding.category_id || ""));
      sessionStorage.setItem("buildingCityId", String(draftBuilding.city_id || ""));
    }
    sessionStorage.setItem("selectedServices", JSON.stringify(restoredServices));
    sessionStorage.setItem("orderTotal", String(draft.total_amount || restoredServices.reduce((sum, service) => sum + service.price, 0)));
    sessionStorage.setItem("orderDescription", draft.description || "");

    if (draftBuildingId) {
      setCurrentStep(restoredServices.length > 0 ? 3 : 2);
    }
  };

  useEffect(() => {
    if (!token || draftLoaded) {
      return;
    }

    const loadDraft = async () => {
      const draft = await dispatch(fetchDraftOrder()).unwrap() as DraftOrderResponse | null;//проверяем есть ли уже черновик заявки
      setDraftLoaded(true);
      if (draft && (draft.order_id || draft.id)) {
        hydrateDraftOrder(draft);
        return;
      }

      setCurrentStep(sessionStorage.getItem("buildingId") ? 2 : 1);
    };

    loadDraft();
  }, [token, draftLoaded, dispatch]);

  useEffect(() => {
    const computedTotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
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
    if (!name.trim() || !description.trim() || !address.trim() || !categoryId || (userRole === "Admin" && !cityId)) {
      alert("Пожалуйста, заполните все обязательные поля для здания.");
      return false;
    }
    const hasSelectedPhoto = files.some((file) => file.type.startsWith("image/"));
    if (!hasExistingBuildingPhoto && !hasSelectedPhoto) {
      alert("Пожалуйста, загрузите хотя бы одно фото здания.");
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
      if (hasSelectedPhoto) setHasExistingBuildingPhoto(true);

      return result.id || buildingId || false;
    } catch (err) {
      console.error(err);
      alert("Ошибка при создании/обновлении здания");
      return false;
    }
  };

  const generateBuildingDescription = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setDescriptionGenerationError("Введите название здания");
      return;
    }

    const aiApiUrl = import.meta.env.VITE_AI_API_URL || "/ai";

    setIsDescriptionGenerating(true);
    setDescriptionGenerationError(null);

    try {
      const { data } = await axios.post<{ description: string; category_id?: number | null }>(
        `${aiApiUrl}/generate-building-description`,
        {
          name: trimmedName,
          categories: categories.map((category) => ({
            id: category.id,
            name: category.name,
          })),
        }
      );

      setDescription(data.description);
      if (
        typeof data.category_id === "number" &&
        categories.some((category) => category.id === data.category_id)
      ) {
        setCategoryId(data.category_id);
      }
    } catch (err) {
      console.error(err);
      const message = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error || "Не удалось сгенерировать описание"
        : "Не удалось сгенерировать описание";
      setDescriptionGenerationError(message);
    } finally {
      setIsDescriptionGenerating(false);
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
      const draftOrder = result as DraftOrderResponse;
      setOrderId(draftOrder.id || draftOrder.order_id || null);
      return true;
    } catch (err) {
      console.error(err);
      if (typeof err === 'object' && err !== null && 'response' in err && (err as { response?: { status?: number } }).response?.status === 400) {
        const draft = await dispatch(fetchDraftOrder()).unwrap() as DraftOrderResponse | null;
        if (draft && (draft.order_id || draft.id)) {
          hydrateDraftOrder(draft);
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

  const handleSubmit = async (e: React.FormEvent) => {//отправляем заявку на проверку администратору
    e.preventDefault();

    try {
      const result = await dispatch(FormOrder({ orderId: orderId! })).unwrap();
      console.log(result);
      if (result.status === 'pending_review') {
        alert("Заявка отправлена на проверку администратору! ID: " + orderId);
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
      setCityId(userRole === "City" && user?.city_id !== undefined ? user.city_id : "");
      setFiles([]);
      setTotal(0);
      setOrderDescription("");
      setSelectedServices([]);
      setBuildingId(null);
      setOrderId(null);
      setHasExistingBuildingPhoto(false);
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
      <Container className="create-order-page py-4">
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
              userRole={userRole}
              name={name}
              description={description}
              address={address}
              categoryId={categoryId}
              cityId={cityId}
              files={files}
              isDescriptionGenerating={isDescriptionGenerating}
              descriptionGenerationError={descriptionGenerationError}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              onAddressChange={setAddress}
              onCategoryChange={setCategoryId}
              onCityChange={setCityId}
              onFilesChange={setFiles}
              onGenerateDescription={generateBuildingDescription}
            />
          )}

          {currentStep === 2 && (
            <CreateOrderServicesStep
              services={services}
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

          <div className="create-order-actions">
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
