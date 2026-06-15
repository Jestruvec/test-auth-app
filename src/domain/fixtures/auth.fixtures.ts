import type { AuthSession } from "../types/auth-session";
import type { AuthTokens } from "../types/auth-tokens";
import type { LoginCredentials } from "../types/login-credentials";
import type { RegisterData } from "../types/register-data";
import { mockRegularUser, mockAdminUser } from "./user.fixtures";

export const mockAuthTokens: AuthTokens = {
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-access-token",
  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-refresh-token",
  expiresIn: 3600,
};

export const mockExpiringSoonTokens: AuthTokens = {
  ...mockAuthTokens,
  expiresIn: 240,
};

export const mockAuthSession: AuthSession = {
  user: mockRegularUser,
  tokens: mockAuthTokens,
};

export const mockAdminAuthSession: AuthSession = {
  user: mockAdminUser,
  tokens: mockAuthTokens,
};

export const mockLoginCredentials: LoginCredentials = {
  email: "user@example.com",
  password: "SecurePass123!",
  rememberMe: false,
};

export const mockRegisterData: RegisterData = {
  email: "newuser@example.com",
  password: "SecurePass123!",
  firstName: "Nuevo",
  lastName: "Usuario",
  phone: "+34612345678",
};

export function createMockAuthTokens(
  overrides: Partial<AuthTokens> = {}
): AuthTokens {
  return {
    ...mockAuthTokens,
    ...overrides,
  };
}

export function createMockAuthSession(
  overrides: Partial<AuthSession> = {}
): AuthSession {
  return {
    ...mockAuthSession,
    ...overrides,
  };
}
