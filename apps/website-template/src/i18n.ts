import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

// Can be imported from a shared config
export const locales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ar', 'ru'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the locale from the request
  let locale = await requestLocale;
  
  // If no locale is provided or it's not valid, default to 'en'
  if (!locale || !locales.includes(locale as any)) {
    locale = 'en';
  }

  return {
    locale,
    messages: {}, // Messages will be loaded dynamically from the database
  };
});