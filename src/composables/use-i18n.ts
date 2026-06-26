import { computed, type Ref } from "vue";
import { ui } from "@/i18n/ui";

export function useI18n(locale?: Ref<string | undefined> | string) {
  const currentLang = computed(() => {
    // Si se proporciona un locale, usarlo
    if (locale) {
      const lang = typeof locale === "string" ? locale : locale.value;
      if (lang && (lang === "es" || lang === "en")) {
        return lang;
      }
    }

    // Fallback: detectar desde la URL (solo en cliente)
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const lang = path.split("/", 2)[1];
      return lang === "es" || lang === "en" ? lang : "en";
    }

    return "en";
  });

  const t = (key: string) => {
    const keys = key.split(".");
    let value: any = ui[currentLang.value as keyof typeof ui];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  return {
    currentLang,
    t,
  };
}
