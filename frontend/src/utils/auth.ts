export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}