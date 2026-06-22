import {
  signUp,
  confirmSignUp,
  resendSignUpCode,
  signIn,
  signOut,
  getCurrentUser as amplifyGetCurrentUser,
  fetchUserAttributes,
  fetchAuthSession,
  resetPassword,
  confirmResetPassword,
} from "aws-amplify/auth";
import type { IAuthRepository } from "@/domain/repositories/i-auth-repository";
import type { User } from "@/domain/entities/user";
import type { RegisterData } from "@/domain/types/register-data";
import type { LoginCredentials } from "@/domain/types/login-credentials";
import type { AuthSession } from "@/domain/types/auth-session";
import { USER_ROLES } from "@/domain/types/user-role";

export interface AuthError extends Error {
  code: string;
}

function createAuthError(message: string, code: string): AuthError {
  const error = new Error(message) as AuthError;
  error.code = code;
  return error;
}

function handleAmplifyError(error: unknown): AuthError {
  // Si ya es un AuthError, retornarlo directamente
  if (
    error instanceof Error &&
    "code" in error &&
    typeof (error as AuthError).code === "string"
  ) {
    return error as AuthError;
  }

  const errorState = error as { message?: string; name?: string };
  const errorMessage = errorState.message ?? "Error desconocido";
  const errorName = errorState.name ?? "";

  switch (errorName) {
    case "UsernameExistsException": {
      return createAuthError(
        "Este email ya está registrado",
        "UsernameExistsException"
      );
    }
    case "UserNotFoundException": {
      return createAuthError("Usuario no encontrado", "UserNotFoundException");
    }
    case "NotAuthorizedException": {
      return createAuthError(
        "Email o contraseña incorrectos",
        "NotAuthorizedException"
      );
    }
    case "CodeMismatchException": {
      return createAuthError(
        "Código de verificación incorrecto",
        "CodeMismatchException"
      );
    }
    case "ExpiredCodeException": {
      return createAuthError(
        "El código de verificación ha expirado",
        "ExpiredCodeException"
      );
    }
    case "InvalidPasswordException": {
      return createAuthError(
        "La contraseña no cumple los requisitos de seguridad",
        "InvalidPasswordException"
      );
    }
    case "LimitExceededException": {
      return createAuthError(
        "Demasiados intentos. Intenta más tarde",
        "LimitExceededException"
      );
    }
    case "UserNotConfirmedException": {
      return createAuthError(
        "Debes verificar tu email antes de iniciar sesión",
        "UserNotConfirmedException"
      );
    }
    case "InvalidParameterException": {
      return createAuthError(
        "No se puede restablecer la contraseña porque no hay un email registrado o verificado",
        "InvalidParameterException"
      );
    }
    default: {
      return createAuthError(errorMessage, errorName);
    }
  }
}

export const amplifyAuthRepository: IAuthRepository = {
  async register(
    data: RegisterData
  ): Promise<{ userId: string; email: string }> {
    try {
      const userAttributes: Record<string, string> = {
        email: data.email,
        given_name: data.firstName,
        family_name: data.lastName,
      };

      // Only include phone_number if provided
      if (data.phone) {
        userAttributes.phone_number = data.phone;
      }

      const { userId } = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes,
        },
      });

      return {
        userId: userId ?? "",
        email: data.email,
      };
    } catch (error) {
      throw handleAmplifyError(error);
    }
  },

  async confirmEmail(email: string, code: string): Promise<void> {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
    } catch (error) {
      throw handleAmplifyError(error);
    }
  },

  async resendConfirmationCode(email: string): Promise<void> {
    try {
      await resendSignUpCode({
        username: email,
      });
    } catch (error) {
      throw handleAmplifyError(error);
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: credentials.email,
        password: credentials.password,
      });

      if (!isSignedIn) {
        if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
          throw createAuthError(
            "Debes verificar tu email antes de iniciar sesión",
            "UserNotConfirmedException"
          );
        }
        throw new Error(`Login incompleto: ${nextStep.signInStep}`);
      }

      const session = await fetchAuthSession();

      if (!session.tokens) {
        throw new Error("No se obtuvieron tokens de sesión");
      }

      const cognitoUser = await amplifyGetCurrentUser();
      const attributes = await fetchUserAttributes();

      const user: User = {
        id: cognitoUser.userId,
        email: attributes.email ?? "",
        firstName: attributes.given_name ?? "",
        lastName: attributes.family_name ?? "",
        role: USER_ROLES.USER,
        emailVerified: attributes.email_verified === "true",
        avatar: attributes.picture ?? null,
        phone: attributes.phone_number ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expiresAt = session.tokens.accessToken.payload.exp
        ? new Date(session.tokens.accessToken.payload.exp * 1000)
        : new Date();
      const now = new Date();
      const expiresIn = Math.max(
        0,
        Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
      );

      return {
        user,
        tokens: {
          accessToken: session.tokens.accessToken.toString(),
          refreshToken: session.tokens.idToken?.toString() ?? "",
          expiresIn,
        },
      };
    } catch (error) {
      throw handleAmplifyError(error);
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut();
    } catch (error) {
      throw handleAmplifyError(error);
    }
  },

  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const session = await fetchAuthSession();

      if (!session.tokens) {
        return null;
      }

      const cognitoUser = await amplifyGetCurrentUser();
      const attributes = await fetchUserAttributes();

      const user: User = {
        id: cognitoUser.userId,
        email: attributes.email ?? "",
        firstName: attributes.given_name ?? "",
        lastName: attributes.family_name ?? "",
        role: USER_ROLES.USER,
        emailVerified: attributes.email_verified === "true",
        avatar: attributes.picture ?? null,
        phone: attributes.phone_number ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expiresAt = session.tokens.accessToken.payload.exp
        ? new Date(session.tokens.accessToken.payload.exp * 1000)
        : new Date();
      const now = new Date();
      const expiresIn = Math.max(
        0,
        Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
      );

      return {
        user,
        tokens: {
          accessToken: session.tokens.accessToken.toString(),
          refreshToken: session.tokens.idToken?.toString() ?? "",
          expiresIn,
        },
      };
    } catch {
      return null;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const cognitoUser = await amplifyGetCurrentUser();
      const attributes = await fetchUserAttributes();

      return {
        id: cognitoUser.userId,
        email: attributes.email ?? "",
        firstName: attributes.given_name ?? "",
        lastName: attributes.family_name ?? "",
        role: USER_ROLES.USER,
        emailVerified: attributes.email_verified === "true",
        avatar: attributes.picture ?? null,
        phone: attributes.phone_number ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch {
      return null;
    }
  },

  async refreshSession(): Promise<AuthSession> {
    try {
      const session = await fetchAuthSession({ forceRefresh: true });

      if (!session.tokens) {
        throw new Error("No se pudieron refrescar los tokens");
      }

      const cognitoUser = await amplifyGetCurrentUser();
      const attributes = await fetchUserAttributes();

      const user: User = {
        id: cognitoUser.userId,
        email: attributes.email ?? "",
        firstName: attributes.given_name ?? "",
        lastName: attributes.family_name ?? "",
        role: USER_ROLES.USER,
        emailVerified: attributes.email_verified === "true",
        avatar: attributes.picture ?? null,
        phone: attributes.phone_number ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expiresAt = session.tokens.accessToken.payload.exp
        ? new Date(session.tokens.accessToken.payload.exp * 1000)
        : new Date();
      const now = new Date();
      const expiresIn = Math.max(
        0,
        Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
      );

      return {
        user,
        tokens: {
          accessToken: session.tokens.accessToken.toString(),
          refreshToken: session.tokens.idToken?.toString() ?? "",
          expiresIn,
        },
      };
    } catch (error) {
      throw handleAmplifyError(error);
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      await resetPassword({ username: email });
    } catch (error) {
      throw handleAmplifyError(error);
    }
  },

  async confirmResetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
    } catch (error) {
      throw handleAmplifyError(error);
    }
  },
};
