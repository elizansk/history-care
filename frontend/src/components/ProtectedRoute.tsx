import { Navigate } from "react-router-dom";
import { getUser } from "../utils/auth";
import React from "react";
interface Props {
  children: React.ReactNode;  // защищаемый компонент
  allowedRoles?: string[];// разрешенные роли
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const user = getUser();  // получаем пользователя
    console.log(user);
  if (!user) { // если пользователя нет редирект на login
    return <Navigate to="/login" />;
  }
  // если роль не подходит
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}