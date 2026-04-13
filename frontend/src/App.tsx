import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreateOrder from './pages/CreateOrder';
import User from './pages/User.tsx';
import Admin from './pages/Admin.tsx';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
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

      </Routes>
    </BrowserRouter>
  );
}

export default App;