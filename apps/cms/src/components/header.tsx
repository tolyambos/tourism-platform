import { UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Tourism Platform CMS</h1>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4">
              <a href="/dashboard" className="text-gray-700 hover:text-gray-900">
                Dashboard
              </a>
              <a href="/sites" className="text-gray-700 hover:text-gray-900">
                Sites
              </a>
              <a href="/templates" className="text-gray-700 hover:text-gray-900">
                Templates
              </a>
            </nav>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </div>
    </header>
  );
}