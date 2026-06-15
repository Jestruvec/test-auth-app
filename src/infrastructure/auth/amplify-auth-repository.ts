import {
  signUp,
  confirmSignUp,
  resendSignUpCode,
  signIn,
  signOut,
  getCurrentUser as amplifyGetCurrentUser,
  fetchUserAttributes,
  fetchAuthSession,
} from "aws-amplify/auth";
import type { IAuthRepository } from "@/domain/repositories/i-auth-repository";
import type { User } from "@/domain/entities/user";
import type { RegisterData } from "@/domain/types/register-data";
import type { LoginCredentials } from "@/domain/types/login-credentials";
import type { AuthSession } from "@/domain/types/auth-session";
import { USER_ROLES } from "@/domain/types/user-role";

function handleAmplifyError(error: unknown): Error {
  const errorState = error as { message?: string; name?: string };
  const errorMessage = errorState.message ?? "Error desconocido";
  const errorName = errorState.name ?? "";

  switch (errorName) {
    case "UsernameExistsException": {
      return new Error("Este email ya está registrado");
    }
    case "UserNotFoundException": {
      return new Error("Usuario no encontrado");
    }
    case "NotAuthorizedException": {
      return new Error("Email o contraseña incorrectos");
    }
    case "CodeMismatchException": {
      return new Error("Código de verificación incorrecto");
    }
    case "ExpiredCodeException": {
      return new Error("El código de verificación ha expirado");
    }
    case "InvalidPasswordException": {
      return new Error("La contraseña no cumple los requisitos de seguridad");
    }
    case "LimitExceededException": {
      return new Error("Demasiados intentos. Intenta más tarde");
    }
    case "UserNotConfirmedException": {
      return new Error("Debes verificar tu email antes de iniciar sesión");
    }
    default: {
      return new Error(errorMessage);
    }
  }
}

export const amplifyAuthRepository: IAuthRepository = {
  async register(
    data: RegisterData
  ): Promise<{ userId: string; email: string }> {
    try {
      const { userId } = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            given_name: data.firstName,
            family_name: data.lastName,
            phone_number: data.phone,
          },
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
};
