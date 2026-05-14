import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  Configuration,
  OrdersApi,
  BuildingsApi,
  CategoriesApi,
  ServicesApi,
  OrdersServicesApi,
  CitiesApi
} from '../api/generated';
//импорт автосгенерированных API клиентов из swagger
const config = new Configuration({// конфиг для API клиентов
  basePath: import.meta.env.VITE_API_URL || '',//базовый URL backend
  accessToken: () => localStorage.getItem('token') || '',//автоматически добавляет JWT ко всем запросам
});
console.log(config);

const ordersApi = new OrdersApi(config);// API для заказов
const buildingsApi = new BuildingsApi(config);// API для зданий
const categoriesApi = new CategoriesApi(config);
const servicesApi = new ServicesApi(config);
const citiesApi = new CitiesApi(config);
const ordersServicesApi = new OrdersServicesApi(config);

interface OrderState {// интерфейс состояния Redux
  loading: boolean;
  error: string | null;
  categories: any[];
  cities: any[];
  services: any[];
  building: any | null;
  order: any | null;
}

const initialState: OrderState = {// // начальное состояние Redux store
  loading: false,
  error: null,
  categories: [],
  cities: [],
  services: [],
  building: null,
  order: null,
};

// Async thunks
export const fetchCategories = createAsyncThunk(// async action для получения категорий
  'order/fetchCategories',
  async () => {
    const response = await categoriesApi.apiCategoriesGet();
    return response.data;
  }
);

export const fetchCities = createAsyncThunk(//   async action для получения городов
  'order/fetchCities',
  async () => {
    const response = await citiesApi.apiCitiesGet();
    return response.data;
  }
);

export const fetchServices = createAsyncThunk(
  'order/fetchServices',
  async () => {
    const response = await servicesApi.apiServicesGet();   // запрос на backend
    return response.data;
  }
);

export const createBuilding = createAsyncThunk(
  'order/createBuilding',//  // уникальное имя action
  async (data: { name: string; description: string; address: string; category_id: number; city_id: number; files: File[] }) => {
    const response = await buildingsApi.apiBuildingsPost(
      data.name,
      data.address,
      data.category_id,
      data.files,
      data.description,
      data.city_id
    );
    return response.data; // data — объект который приходит из формы
  }
);

export const updateBuilding = createAsyncThunk(
  'order/updateBuilding',
  async ({ id, data }: { id: number; data: { name: string; description: string; address: string; category_id: number; city_id: number; files: File[] } }) => {
    const response = await buildingsApi.apiBuildingsIdPut(
      id,
      data.name,
      data.description,
      data.address,
      data.category_id,
      data.city_id,
      data.files
    );
    return response.data;//вовращаем id здания
  }
);

export const createOrderDraft = createAsyncThunk(
  'order/createOrderDraft',
  async (buildingId: number) => {
    const response = await ordersApi.apiOrdersDraftPost({ building_id: buildingId });
    return response.data;
  }
);

export const fetchDraftOrder = createAsyncThunk(
  'order/fetchDraftOrder',
  async () => {
    try {
      const response = await ordersApi.apiOrdersDraftGet();
      return response.data;
    } catch (err: any) {  // если черновик не найден
      if (err?.response?.status === 404) {
        return null;
      }// остальные ошибки пробрасываем дальше
      throw err;
    }
  }
);

export const deleteDraftService = createAsyncThunk(
  'order/deleteDraftService',
  async (serviceId: number) => {
    const response = await ordersServicesApi.apiOrdersServicesServiceIdDelete(serviceId);
    return response.data;
  }
);

export const addServicesToOrder = createAsyncThunk(
  'order/addServicesToOrder',
  async ({ orderId, services }: { orderId: number; services: { service_id: number; description: string; price: number; quantity: number }[] }) => {
    const response = await ordersServicesApi.apiOrdersIdServicesPost(orderId, { services });
    return response.data;
  }
);

export const FormOrder = createAsyncThunk(
  'order/formOrder',
  async ({ orderId }: { orderId: number }) => {
    const response = await ordersApi.apiOrdersIdFormPut(orderId);
    return response.data;
  }
);

const orderSlice = createSlice({
  name: 'order', // имя slice
  initialState,  // начальный state
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetOrder: (state) => {// сброс текущего заказа
      state.building = null;
      state.order = null;
    },
  },
  extraReducers: (builder) => {//обработка async state
    builder
      .addCase(fetchCategories.pending, (state) => {  // запрос начался
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => { // запрос успешен
        state.loading = false;
        state.categories = action.payload; // сохраняем категории
      })
      .addCase(fetchCategories.rejected, (state, action) => {   // ошибка запроса
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      .addCase(fetchCities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cities';
      })
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch services';
      })
      .addCase(createBuilding.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBuilding.fulfilled, (state, action) => {
        state.loading = false;
        state.building = action.payload;
      })
      .addCase(createBuilding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create building';
      })
      .addCase(updateBuilding.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBuilding.fulfilled, (state, action) => {
        state.loading = false;
        state.building = action.payload;
      })
      .addCase(updateBuilding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update building';
      })
      .addCase(createOrderDraft.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrderDraft.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(createOrderDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create order draft';
      })
      .addCase(fetchDraftOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDraftOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchDraftOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch draft order';
      })
      .addCase(deleteDraftService.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteDraftService.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteDraftService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete draft service';
      })
      .addCase(addServicesToOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(addServicesToOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(addServicesToOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add services';
      })
      .addCase(FormOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(FormOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(FormOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to submit order';
      });
  },
});

export const { clearError, resetOrder } = orderSlice.actions;
export default orderSlice.reducer;