import { defaultLang, ui } from "./ui";

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key];
  };
}

export function getTranslations(lang: keyof typeof ui) {
  return ui[lang];
}
