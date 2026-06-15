import type { IAuthRepository } from "@/domain/repositories/i-auth-repository";
import type { User } from "@/domain/entities/user";

export function createGetCurrentUserUseCase(authRepository: IAuthRepository) {
  return {
    execute: async (): Promise<User | null> =>
      await authRepository.getCurrentUser(),
  };
}
