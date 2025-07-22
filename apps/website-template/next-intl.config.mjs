import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ar', 'ru'];

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the locale from the request
  let locale = await requestLocale;
  
  // If no locale is provided or it's not valid, default to 'en'
  if (!locale || !locales.includes(locale)) {
    locale = 'en';
  }

  return {
    locale,
    messages: {}, // Messages will be loaded dynamically from the database
  };
});