export const i18n = {
  defaultLocale: "sk",
  locales: ["en", "sk"],
} as const;

export type Locale = (typeof i18n)["locales"][number];
