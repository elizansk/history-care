import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { clearCreateOrderSession, clearUserFiltersSession } from "../utils/session";

interface User {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string | { id?: number; name?: string };
  Role?: { id?: number; name?: string };
  city_id?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;//флаг авторизации
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),//берётся token из localStorage
  isAuthenticated: !!localStorage.getItem('token'),//если есть token пользователь считается авторизованным
};

const authSlice = createSlice({//сохраняет пользователя ,сохраняет токен, записывает token в localStorage
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {//очищает user,очищает token,удаляет token из localStorage,очищает session данные:
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      clearCreateOrderSession();
      clearUserFiltersSession();
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;//Обновляет только пользователя:
    },
  },
});

export const { login, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
