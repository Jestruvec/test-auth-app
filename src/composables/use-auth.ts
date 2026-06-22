import { ref, computed } from "vue";
import { amplifyAuthRepository } from "@/infrastructure/auth";
import {
  createRegisterUseCase,
  createLoginUseCase,
  createLogoutUseCase,
  createGetCurrentUserUseCase,
  createGetCurrentSessionUseCase,
  createResetPasswordUseCase,
} from "@/application/auth";
import type { RegisterData } from "@/domain/types/register-data";
import type { LoginCredentials } from "@/domain/types/login-credentials";
import type { User } from "@/domain/entities/user";

export function useAuth() {
  const registerUseCase = createRegisterUseCase(amplifyAuthRepository);
  const loginUseCase = createLoginUseCase(amplifyAuthRepository);
  const logoutUseCase = createLogoutUseCase(amplifyAuthRepository);
  const getCurrentUserUseCase = createGetCurrentUserUseCase(
    amplifyAuthRepository
  );
  const getCurrentSessionUseCase = createGetCurrentSessionUseCase(
    amplifyAuthRepository
  );
  const resetPasswordUseCase = createResetPasswordUseCase(
    amplifyAuthRepository
  );

  const currentUser = ref<User | null>(null);
  const isLoading = ref(false);
  const errorState = ref<null | { code: string; message: string }>(null);

  const isOtpError = computed(() => {
    return (
      errorState.value?.code === "CodeMismatchException" ||
      errorState.value?.code === "ExpiredCodeException"
    );
  });

  const isInvalidParameterError = computed(() => {
    return errorState.value?.code === "InvalidParameterException";
  });

  const isNotAuthorizedError = computed(() => {
    return errorState.value?.code === "NotAuthorizedException";
  });

  const isUserNotConfirmedError = computed(() => {
    return errorState.value?.code === "UserNotConfirmedException";
  });

  const isUsernameExistsError = computed(() => {
    return errorState.value?.code === "UsernameExistsException";
  });

  const handleError = (error: unknown, defaultMessage: string) => {
    const authError = error as { code?: string; message?: string };
    errorState.value = {
      code: authError.code ?? "UnknownError",
      message: authError.message ?? defaultMessage,
    };
  };

  const register = async (data: RegisterData) => {
    isLoading.value = true;
    errorState.value = null;

    try {
      const result = await registerUseCase.execute(data);
      return result;
    } catch (error) {
      handleError(error, "Error al registrar usuario");
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const confirmEmail = async (email: string, code: string) => {
    isLoading.value = true;
    errorState.value = null;

    try {
      await registerUseCase.confirmEmail(email, code);
    } catch (error) {
      handleError(error, "Código inválido");
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const resendCode = async (email: string) => {
    isLoading.value = true;
    errorState.value = null;

    try {
      await registerUseCase.resendCode(email);
    } catch (error) {
      handleError(error, "Error al reenviar código");
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true;
    errorState.value = null;

    try {
      const session = await loginUseCase.execute(credentials);
      currentUser.value = session.user;
      return session;
    } catch (error) {
      handleError(error, "Error al iniciar sesión");
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    isLoading.value = true;
    errorState.value = null;

    try {
      await logoutUseCase.execute();
      currentUser.value = null;
    } catch (error) {
      handleError(error, "Error al cerrar sesión");
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchCurrentUser = async () => {
    isLoading.value = true;
    errorState.value = null;

    try {
      const user = await getCurrentUserUseCase.execute();
      currentUser.value = user;
      return user;
    } catch (error) {
      handleError(error, "Error al obtener usuario");
      currentUser.value = null;
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const checkSession = async () => {
    try {
      const session = await getCurrentSessionUseCase.execute();
      if (session) {
        currentUser.value = session.user;
      }
      return !!session;
    } catch {
      return false;
    }
  };

  const resetPassword = async (email: string) => {
    isLoading.value = true;
    errorState.value = null;

    try {
      await resetPasswordUseCase.execute(email);
    } catch (error) {
      handleError(error, "Error al solicitar recuperación de contraseña");
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const confirmResetPassword = async (
    email: string,
    code: string,
    newPassword: string
  ) => {
    isLoading.value = true;
    errorState.value = null;

    try {
      await resetPasswordUseCase.confirmReset(email, code, newPassword);
    } catch (error) {
      handleError(error, "Error al restablecer contraseña");
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    currentUser,
    isLoading,
    errorState,
    isOtpError,
    isInvalidParameterError,
    isNotAuthorizedError,
    isUserNotConfirmedError,
    isUsernameExistsError,
    register,
    confirmEmail,
    resendCode,
    login,
    logout,
    fetchCurrentUser,
    checkSession,
    resetPassword,
    confirmResetPassword,
  };
}
