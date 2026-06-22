/**
 * Global type definitions for PalaceApp namespace
 * Provides TypeScript autocomplete and type checking for window.PalaceApp
 */

/**
 * Available navigation routes
 */
type NavigationRoute = "landing" | "faceid" | "notification";

/**
 * Event detail types for type-safe event handling
 */
interface PalaceAppEvents {
  navigate: { to: NavigationRoute };
  "registration-complete": undefined;
}

/**
 * PalaceApp global namespace
 */
interface PalaceApp {
  /** App version */
  version: string;

  /**
   * Listen to app events with type-safe event names and details
   * @param event - Event name (will be prefixed with 'palace:')
   * @param callback - Event handler receiving CustomEvent
   */
  on<K extends keyof PalaceAppEvents>(
    event: K,
    callback: (event: CustomEvent<PalaceAppEvents[K]>) => void
  ): void;

  /**
   * Emit app events with type-safe event names and details
   * @param event - Event name (will be prefixed with 'palace:')
   * @param detail - Event data
   */
  emit<K extends keyof PalaceAppEvents>(
    event: K,
    ...arguments: PalaceAppEvents[K] extends undefined
      ? []
      : [detail: PalaceAppEvents[K]]
  ): void;

  /**
   * Remove event listener
   * @param event - Event name (will be prefixed with 'palace:')
   * @param callback - Event handler to remove
   */
  off<K extends keyof PalaceAppEvents>(
    event: K,
    callback: (event: CustomEvent<PalaceAppEvents[K]>) => void
  ): void;
}

/**
 * Login success payload data
 */
interface LoginSuccessPayload {
  NameId: string;
  Email: string;
  PhoneNumber: string;
  FirstName: string;
  LastName: string;
  Token: string;
  ActiveReservation: string;
  ActiveResort: string;
  GuestIdentifier: string;
  ProfileImage: string;
  ProfileGuestType: string;
}

/**
 * Message data structure for React Native WebView communication
 */
export interface ReactNativeMessage {
  action: "login_success";
  payload: LoginSuccessPayload;
}

/**
 * React Native WebView interface
 */
interface ReactNativeWebView {
  postMessage(message: string): void;
}

/**
 * Android native interface
 */
interface AndroidInterface {
  goToGuest(): void;
  goToHome(): void;
}

/**
 * Extend Window interface
 */
declare global {
  interface Window {
    PalaceApp: PalaceApp;
    ReactNativeWebView?: ReactNativeWebView;
    AndroidInterface?: AndroidInterface;
  }
}
