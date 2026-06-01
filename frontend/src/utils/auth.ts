interface UserLike {
  role?: string | { name?: string };
  Role?: { name?: string };
  city_approved?: boolean;
}

export function getUserRoleName(user: UserLike | null | undefined) {
  if (!user) return '';
  if (typeof user.role === 'string') return user.role;
  return user.role?.name || user.Role?.name || '';
}

export function isCityApproved(user: UserLike | null | undefined) {
  return getUserRoleName(user) !== 'City' || user?.city_approved === true;
}

export function getUser() {//Функция получает пользователя из JWT token
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(token.split(".")[1]))));
    return payload;
  } catch {
    return null;
  }
}
