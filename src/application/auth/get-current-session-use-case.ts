import type { IAuthRepository } from "@/domain/repositories/i-auth-repository";
import type { AuthSession } from "@/domain/types/auth-session";

export function createGetCurrentSessionUseCase(
  authRepository: IAuthRepository
) {
  return {
    execute: async (): Promise<AuthSession | null> =>
      await authRepository.getCurrentSession(),
  };
}
