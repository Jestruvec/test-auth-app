import type { App } from "vue";
import {
  MareComponentsPlugin,
  type MareComponentsPluginOptions,
} from "@tpc-development/mare-ui-components";
import Aura from "@primeuix/themes/aura";
import { initializeAmplify } from "@/infrastructure/auth/amplify.config";

const primeConfig = {
  ripple: true,
  theme: {
    preset: Aura,
    options: {
      prefix: "p",
      darkModeSelector: '[data-theme="dark"]',
      cssLayer: false,
    },
  },
};

const mareConfig: MareComponentsPluginOptions = {
  productId: "app",
  applicationId: "astro-app",
  primevueConfig: primeConfig,
};

// Initialize Amplify before mounting Vue.js
initializeAmplify();

export default (app: App) => {
  app.use(MareComponentsPlugin, mareConfig);
};
