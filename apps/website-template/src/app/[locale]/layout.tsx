import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

interface LayoutParams {
  locale: string;
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<LayoutParams>;
}) {
  const { locale } = await params;
  
  // Provide empty messages for now - content comes from database
  const messages = {};
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}