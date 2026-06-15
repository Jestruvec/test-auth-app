import type { IAuthRepository } from "@/domain/repositories/i-auth-repository";
import type { RegisterData } from "@/domain/types/register-data";

export function createRegisterUseCase(authRepository: IAuthRepository) {
  return {
    execute: async (
      data: RegisterData
    ): Promise<{ userId: string; email: string }> =>
      await authRepository.register(data),

    confirmEmail: async (email: string, code: string): Promise<void> => {
      await authRepository.confirmEmail(email, code);
    },

    resendCode: async (email: string): Promise<void> => {
      await authRepository.resendConfirmationCode(email);
    },
  };
}
