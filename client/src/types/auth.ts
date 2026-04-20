export interface User {
  id: string;
  email: string;
  name: string;
  role: 'recruit' | 'manager' | 'admin';
  department: string | null;
  startDate: string | null;
  managerId?: string | null;
  themePreference: 'light' | 'dark' | 'system';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  department?: string;
  startDate?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details: Record<string, string[]> | null;
  };
}
