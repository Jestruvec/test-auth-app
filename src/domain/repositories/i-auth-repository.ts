import type { User } from "../entities/user";
import type { RegisterData } from "../types/register-data";
import type { LoginCredentials } from "../types/login-credentials";
import type { AuthSession } from "../types/auth-session";

export interface IAuthRepository {
  register(data: RegisterData): Promise<{ userId: string; email: string }>;
  confirmEmail(email: string, code: string): Promise<void>;
  resendConfirmationCode(email: string): Promise<void>;
  login(credentials: LoginCredentials): Promise<AuthSession>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<AuthSession | null>;
  getCurrentUser(): Promise<User | null>;
  refreshSession(): Promise<AuthSession>;
}
