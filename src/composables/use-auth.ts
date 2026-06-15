import { ref } from "vue";
import { amplifyAuthRepository } from "@/infrastructure/auth";
import {
  createRegisterUseCase,
  createLoginUseCase,
  createLogoutUseCase,
  createGetCurrentUserUseCase,
  createGetCurrentSessionUseCase,
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

  const currentUser = ref<User | null>(null);
  const isLoading = ref(false);
  const errorState = ref<string | null>(null);

  const register = async (data: RegisterData) => {
    isLoading.value = true;
    errorState.value = null;

    try {
      const result = await registerUseCase.execute(data);
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al registrar usuario";
      errorState.value = message;
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
      const message =
        error instanceof Error ? error.message : "Código inválido";
      errorState.value = message;
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
      const message =
        error instanceof Error ? error.message : "Error al reenviar código";
      errorState.value = message;
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
      const message =
        error instanceof Error ? error.message : "Error al iniciar sesión";
      errorState.value = message;
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
      const message =
        error instanceof Error ? error.message : "Error al cerrar sesión";
      errorState.value = message;
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
      const message =
        error instanceof Error ? error.message : "Error al obtener usuario";
      errorState.value = message;
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

  return {
    currentUser,
    isLoading,
    errorState,
    register,
    confirmEmail,
    resendCode,
    login,
    logout,
    fetchCurrentUser,
    checkSession,
  };
}
