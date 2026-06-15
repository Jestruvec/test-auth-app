import type { User } from "../entities/user";
import type { AuthTokens } from "./auth-tokens";

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}
