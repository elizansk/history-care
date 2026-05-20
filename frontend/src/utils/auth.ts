interface UserLike {
  role?: string | { name?: string };
  Role?: { name?: string };
}

export function getUserRoleName(user: UserLike | null | undefined) {
  if (!user) return '';
  if (typeof user.role === 'string') return user.role;
  return user.role?.name || user.Role?.name || '';
}

export function getUser() {//Функция получает пользователя из JWT token
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}
