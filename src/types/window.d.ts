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
 * Extend Window interface
 */
declare global {
  interface Window {
    PalaceApp: PalaceApp;
  }
}

export {};
