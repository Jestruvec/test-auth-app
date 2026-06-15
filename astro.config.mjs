// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vue from "@astrojs/vue";
import { fileURLToPath } from "node:url";

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("src", import.meta.url)),
        "@components": fileURLToPath(
          new URL("src/components", import.meta.url)
        ),
        "@layouts": fileURLToPath(new URL("src/layouts", import.meta.url)),
        "@pages": fileURLToPath(new URL("src/pages", import.meta.url)),
        "@domain": fileURLToPath(new URL("src/domain", import.meta.url)),
        "@assets": fileURLToPath(new URL("src/assets", import.meta.url)),
        "@styles": fileURLToPath(new URL("src/styles", import.meta.url)),
      },
    },
  },
});
