import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth-slice.ts';
import orderReducer from './order-slice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    order: orderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;