interface FooterProps {
  siteConfig: any;
  locale: string;
}

export function Footer({ siteConfig, locale }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">{siteConfig.name}</h3>
            <p className="text-gray-300 mb-4">
              Discover amazing destinations and create unforgettable memories with our curated travel experiences.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href={`/${locale}/attractions`} className="text-gray-300 hover:text-white transition-colors">
                  Attractions
                </a>
              </li>
              <li>
                <a href={`/${locale}/tours`} className="text-gray-300 hover:text-white transition-colors">
                  Tours
                </a>
              </li>
              <li>
                <a href={`/${locale}/about`} className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href={`/${locale}/contact`} className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Email: info@{siteConfig.domain || 'tourism-platform.com'}</li>
              <li>Phone: +1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {currentYear} {siteConfig.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}