import { useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from './store';
import { setUser } from './store/auth-slice.ts';
import { getUserRoleName } from './utils/auth';
import { getMockUserFromToken, isMockAuthAvailable } from './mock/auth.mock';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreateOrder from './pages/CreateOrder';
import User from './pages/User.tsx';
import MyOrders from './pages/CityOrder.tsx';
import Admin from './pages/Admin.tsx';
import Buildings from './pages/Orders.tsx';
import Building from './pages/Order.tsx';
import Donate from './pages/Donate';
import ProtectedRoute from './components/ProtectedRoute';

const isGithubPages = import.meta.env.MODE === 'github-pages';
const routerBasename = isGithubPages || import.meta.env.BASE_URL === './'
  ? '/'
  : import.meta.env.BASE_URL.replace(/\/$/, '');
const Router = isGithubPages ? HashRouter : BrowserRouter;

function App() {
  const user = useSelector((state: RootState) => state.auth.user);
  const localToken = localStorage.getItem('token');
  const token = useSelector((state: RootState) => state.auth.token) || localToken;
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token || user) return;

    if (isMockAuthAvailable) {
      const mockUser = getMockUserFromToken(token);

      if (mockUser) {
        dispatch(setUser(mockUser));
        return;
      }
    }

    axios.get('/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      dispatch(setUser({
        ...res.data,
        role: getUserRoleName(res.data),
      }));
    })
    .catch((err) => {
      console.error('Failed to load profile:', err);

      if (isMockAuthAvailable) {
        const mockUser = getMockUserFromToken(token);

        if (mockUser) {
          dispatch(setUser(mockUser));
        }
      }
    });
  }, [token, user, dispatch]);

  return (
    <Router basename={routerBasename}>
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
    </Router>
  );
}

export default App;
