import type {
  IEmailAvailabilityRepository,
  CheckEmailResult,
} from "@/domain/repositories/email-availability.repository";

export function createCheckEmailAvailabilityUseCase(
  emailAvailabilityRepository: IEmailAvailabilityRepository
) {
  return {
    execute: async (email: string): Promise<CheckEmailResult> =>
      await emailAvailabilityRepository.checkEmailAvailability(email),
  };
}
