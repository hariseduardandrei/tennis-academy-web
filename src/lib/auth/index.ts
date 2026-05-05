export type UserRole = 'ADMIN' | 'COACH' | 'TRAINER' | 'STUDENT';

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  language: string;
}

const TOKEN_KEY = 'ta_token';
const USER_KEY = 'ta_user';

export const authStorage = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getUser(): CurrentUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CurrentUser;
    } catch {
      return null;
    }
  },
  setUser(user: CurrentUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export function isStaff(role?: UserRole | null): boolean {
  return role === 'ADMIN' || role === 'COACH' || role === 'TRAINER';
}

export function isAdmin(role?: UserRole | null): boolean {
  return role === 'ADMIN';
}

export function isStudent(role?: UserRole | null): boolean {
  return role === 'STUDENT';
}

