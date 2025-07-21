import { getRequestConfig } from 'next-intl/server';
import { locales } from './src/i18n';

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