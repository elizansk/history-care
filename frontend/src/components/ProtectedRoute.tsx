import { Navigate } from "react-router-dom";
import { getUser, getUserRoleName, isCityApproved } from "../utils/auth";
import React from "react";
interface Props {
  children: React.ReactNode;  // защищаемый компонент
  allowedRoles?: string[];// разрешенные роли
  requireApprovedCity?: boolean;
}

export default function ProtectedRoute({ children, allowedRoles, requireApprovedCity }: Props) {
  const user = getUser();  // получаем пользователя
    console.log(user);
  if (!user) { // если пользователя нет редирект на login
    return <Navigate to="/login" />;
  }
  // если роль не подходит
  if (allowedRoles && !allowedRoles.includes(getUserRoleName(user))) {
    return <Navigate to="/" />;
  }

  if (requireApprovedCity && !isCityApproved(user)) {
    return <Navigate to="/profile" />;
  }

  return children;
}
