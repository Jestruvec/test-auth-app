import type { IAuthRepository } from "@/domain/repositories/i-auth-repository";

export function createLogoutUseCase(authRepository: IAuthRepository) {
  return {
    execute: async (): Promise<void> => await authRepository.logout(),
  };
}
