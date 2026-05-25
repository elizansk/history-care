export interface MockAuthUser {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'Admin' | 'User' | 'City';
  Role: {
    id: number;
    name: 'Admin' | 'User' | 'City';
  };
  city_id?: number;
}

export interface MockLoginResponse {
  token: string;
  user: MockAuthUser;
}

const MOCK_PASSWORD = '123456';

export const isMockAuthAvailable =
  import.meta.env.VITE_USE_MOCKS === 'true' || import.meta.env.MODE === 'github-pages';

export const mockUsers: MockAuthUser[] = [
  {
    id: 1,
    name: 'Администратор',
    first_name: 'Админ',
    last_name: 'Админ',
    email: 'admin@mock.ru',
    role: 'Admin',
    Role: { id: 1, name: 'Admin' },
  },
  {
    id: 2,
    name: 'Городской представитель',
    first_name: 'City',
    last_name: 'City',
    email: 'city@mock.ru',
    role: 'City',
    Role: { id: 2, name: 'City' },
    city_id: 100,
  },
  {
    id: 3,
    name: 'Пользователь',
    first_name: 'User',
    last_name: 'User',
    email: 'user@mock.ru',
    role: 'User',
    Role: { id: 3, name: 'User' },
  },
];

const aliases: Record<string, string> = {
  'admin@example.com': 'admin@mock.ru',
  'city@example.com': 'city@mock.ru',
  'user@example.com': 'user@mock.ru',
};

function encodeBase64(value: object) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(value))));
}

export function createMockToken(user: MockAuthUser) {
  const header = encodeBase64({ alg: 'none', typ: 'JWT' });
  const payload = encodeBase64({
    ...user,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  });

  return `${header}.${payload}.mock`;
}

export function getMockUserFromToken(token: string | null): MockAuthUser | null {
  if (!token) return null;

  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(token.split('.')[1]))));
    const role = payload.role?.name || payload.Role?.name || payload.role;

    return {
      id: Number(payload.id),
      name: payload.name || payload.email,
      first_name: payload.first_name || payload.name || '',
      last_name: payload.last_name || '',
      email: payload.email,
      role,
      Role: payload.Role || { id: payload.roleId || 0, name: role },
      city_id: payload.city_id,
    };
  } catch {
    return null;
  }
}

export function mockLogin(email: string, password: string): MockLoginResponse {
  if (password !== MOCK_PASSWORD) {
    throw new Error('Для mock-входа используйте пароль 123456.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const canonicalEmail = aliases[normalizedEmail] || normalizedEmail;
  const user = mockUsers.find((candidate) => candidate.email === canonicalEmail);

  if (!user) {
    throw new Error('Mock-пользователь не найден. Доступны admin@mock.ru, city@mock.ru, user@mock.ru.');
  }

  return {
    token: createMockToken(user),
    user,
  };
}
