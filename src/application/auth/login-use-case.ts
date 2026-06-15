import type { IAuthRepository } from "@/domain/repositories/i-auth-repository";
import type { LoginCredentials } from "@/domain/types/login-credentials";
import type { AuthSession } from "@/domain/types/auth-session";

export function createLoginUseCase(authRepository: IAuthRepository) {
  return {
    execute: async (credentials: LoginCredentials): Promise<AuthSession> => {
      const session = await authRepository.login(credentials);
      return session;
    },
  };
}
