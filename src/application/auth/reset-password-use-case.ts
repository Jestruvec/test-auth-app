import type { IAuthRepository } from "@/domain/repositories/i-auth-repository";

export interface ResetPasswordUseCase {
  execute(email: string): Promise<void>;
  confirmReset(email: string, code: string, newPassword: string): Promise<void>;
}

export const createResetPasswordUseCase = (
  authRepository: IAuthRepository
): ResetPasswordUseCase => ({
  execute: (email: string) => authRepository.resetPassword(email),
  confirmReset: (email: string, code: string, newPassword: string) =>
    authRepository.confirmResetPassword(email, code, newPassword),
});
