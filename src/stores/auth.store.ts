import { atom } from "nanostores";

/**
 * Store for prefilling email when user already has an account
 * Used during register → login flow
 */
export const prefillEmailStore = atom<string | null>(null);

export const setPrefillEmail = (email: string | null) => {
  prefillEmailStore.set(email);
};

export const clearPrefillEmail = () => {
  prefillEmailStore.set(null);
};
