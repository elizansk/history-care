import { useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from './store';
import { setUser } from './store/auth-slice.ts';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreateOrder from './pages/CreateOrder';
import User from './pages/User.tsx';
import MyOrders from './pages/MyOrders';
import Admin from './pages/Admin.tsx';
import Buildings from './pages/Buildings';
import Building from './pages/Building';
import Donate from './pages/Donate';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const user = useSelector((state: RootState) => state.auth.user);
  const localToken = localStorage.getItem('token');
  const token = useSelector((state: RootState) => state.auth.token) || localToken;
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token || user) return;

    axios.get('/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      dispatch(setUser(res.data));
    })
    .catch((err) => {
      console.error('Failed to load profile:', err);
    });
  }, [token, user, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Личный кабинет — ВСЕ */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["User", "City", "Admin"]}>
              <User />
            </ProtectedRoute>
          }
        />

        {/* Создание заявки — только City + Admin */}
        <Route
          path="/create-order"
          element={
            <ProtectedRoute allowedRoles={["City", "Admin"]}>
              <CreateOrder />
            </ProtectedRoute>
          }
        />

        {/* Админ — только Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute allowedRoles={["User", "City", "Admin"]}>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        {/* Заявки на реконструкцию и донаты */}
        <Route path="/buildings" element={<Buildings />} />
        <Route path="/building/:id" element={<Building />} />
        <Route path="/donate/:id" element={<Donate />} />
        <Route path="/donate" element={<Donate />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;