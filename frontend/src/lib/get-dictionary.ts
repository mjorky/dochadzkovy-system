import "server-only";
import type { Dictionary, Locale } from "./dictionary-types";

const dictionaries = {
  en: () =>
    import("@/dictionaries/en.json").then(
      (module) => module.default as Dictionary,
    ),
  sk: () =>
    import("@/dictionaries/sk.json").then(
      (module) => module.default as Dictionary,
    ),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  return dictionaries[locale]?.() ?? dictionaries.sk();
};
