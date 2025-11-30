// i18n Module
// src/i18n/index.ts

export const defaultLocale = "de";
export const supportedLocales = ["de", "en"] as const;
export type Locale = (typeof supportedLocales)[number];

import de from "./locales/de.json";
import en from "./locales/en.json";

const translations: Record<Locale, typeof de> = { de, en };

/**
 * Get translation for a key
 */
export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const keys = key.split(".");
  let value: unknown = translations[locale] || translations[defaultLocale];
  
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Return key if not found
    }
  }
  
  if (typeof value !== "string") {
    return key;
  }
  
  // Replace params like {name} with actual values
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, paramKey) => 
      String(params[paramKey] ?? `{${paramKey}}`)
    );
  }
  
  return value;
}

/**
 * Create a translator function for a specific locale
 */
export function createTranslator(locale: Locale) {
  return (key: string, params?: Record<string, string | number>) => t(locale, key, params);
}

/**
 * Get locale from Accept-Language header
 */
export function getLocaleFromHeader(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  
  const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
  
  if (preferred && supportedLocales.includes(preferred as Locale)) {
    return preferred as Locale;
  }
  
  return defaultLocale;
}

/**
 * Get locale from URL path
 */
export function getLocaleFromPath(path: string): Locale | null {
  const match = path.match(/^\/([a-z]{2})(\/|$)/);
  if (match && supportedLocales.includes(match[1] as Locale)) {
    return match[1] as Locale;
  }
  return null;
}
