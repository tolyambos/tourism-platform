import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './i18n';

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always', // Change to 'always' to ensure locale is in the URL
  // Preserve query parameters in redirects
  localeDetection: false
});

export async function middleware(request: NextRequest) {
  // Get the hostname from the request
  const hostname = request.headers.get('host') || '';
  
  // Check for subdomain in query parameter (for local development)
  const url = new URL(request.url);
  const subdomainParam = url.searchParams.get('subdomain');
  
  // Extract subdomain (e.g., barcelona.tourism-platform.com -> barcelona)
  const subdomain = hostname.split('.')[0];
  
  // Check if this is a localhost with subdomain (e.g., rome.localhost)
  const isLocalSubdomain = hostname.includes('.localhost');
  
  // Check if this is a custom domain or subdomain request
  const isSubdomain = (hostname.includes('.') && !hostname.includes('localhost:')) || isLocalSubdomain;
  const isCustomDomain = !hostname.includes('tourism-platform.com') && !hostname.includes('localhost');
  
  // If it's a subdomain or custom domain, or we have a subdomain parameter, add it to the request headers
  if (isSubdomain || isCustomDomain || subdomainParam) {
    // Create a new request with modified headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-site-domain', hostname);
    requestHeaders.set('x-site-subdomain', subdomainParam || subdomain);
    
    // Create a new request with the modified headers
    const modifiedRequest = new NextRequest(request, {
      headers: requestHeaders
    });
    
    // Run the intl middleware with the modified request
    const response = await intlMiddleware(modifiedRequest);
    
    // If it's a response (not a NextResponse redirect), add our headers
    if (response && response.headers) {
      response.headers.set('x-site-domain', hostname);
      response.headers.set('x-site-subdomain', subdomainParam || subdomain);
    }
    
    return response;
  }
  
  // For localhost or main domain, just run intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - api routes
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  // - public files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg)$).*)']
};