import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Tourism Platform',
  description: 'Discover amazing destinations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        
        {/* Performance monitoring */}
        {process.env.NODE_ENV === 'production' && (
          <Script
            id="web-vitals"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
                  function sendToAnalytics(metric) {
                    // Replace with your analytics service
                    console.log(metric);
                  }
                  onCLS(sendToAnalytics);
                  onFID(sendToAnalytics);
                  onFCP(sendToAnalytics);
                  onLCP(sendToAnalytics);
                  onTTFB(sendToAnalytics);
                });
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}