import type { App } from "vue";
import {
  MareComponentsPlugin,
  type MareComponentsPluginOptions,
} from "@tpc-development/mare-ui-components";
import Aura from "@primeuix/themes/aura";

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

export default (app: App) => {
  app.use(MareComponentsPlugin, mareConfig);
};
