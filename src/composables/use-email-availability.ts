import { ref } from "vue";
import { httpEmailAvailabilityRepository } from "@/infrastructure/email-availability/http-email-availability-repository";
import { createCheckEmailAvailabilityUseCase } from "@/application/email-availability";
import type { CheckEmailResult } from "@/domain/repositories/email-availability.repository";

export function useEmailAvailability() {
  const checkEmailAvailabilityUseCase = createCheckEmailAvailabilityUseCase(
    httpEmailAvailabilityRepository
  );

  const isCheckingEmail = ref(false);
  const errorState = ref<null | { code: string; message: string }>(null);

  const handleError = (error: unknown, defaultMessage: string) => {
    const authError = error as { code?: string; message?: string };
    errorState.value = {
      code: authError.code ?? "UnknownError",
      message: authError.message ?? defaultMessage,
    };
  };

  const checkEmailAvailability = async (
    email: string
  ): Promise<CheckEmailResult | null> => {
    isCheckingEmail.value = true;
    errorState.value = null;

    try {
      const result = await checkEmailAvailabilityUseCase.execute(email);
      return result;
    } catch (error) {
      handleError(error, "Error al verificar disponibilidad");
      return null;
    } finally {
      isCheckingEmail.value = false;
    }
  };

  return {
    isCheckingEmail,
    errorState,
    checkEmailAvailability,
  };
}
