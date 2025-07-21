import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Site {
  id: string;
  name: string;
  subdomain: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  type: 'CITY' | 'ATTRACTION' | 'REGION' | 'CUSTOM';
  createdAt: Date;
}

interface RecentSitesProps {
  sites: Site[];
}

export function RecentSites({ sites }: RecentSitesProps) {
  if (sites.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Sites
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Your recently created tourism websites
          </p>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <p className="text-sm text-gray-500">No sites created yet.</p>
          <Link
            href="/sites/create"
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create your first site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Sites
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Your recently created tourism websites
            </p>
          </div>
          <Link
            href="/sites"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all
          </Link>
        </div>
      </div>
      <ul className="divide-y divide-gray-200">
        {sites.map((site) => (
          <li key={site.id}>
            <Link href={`/sites/${site.id}`} className="block hover:bg-gray-50">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        site.type === 'CITY' 
                          ? 'bg-blue-100 text-blue-800' 
                          : site.type === 'ATTRACTION'
                          ? 'bg-green-100 text-green-800'
                          : site.type === 'REGION'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {site.type}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {site.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {site.subdomain}.tourism-platform.com
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      site.status === 'PUBLISHED' 
                        ? 'bg-green-100 text-green-800'
                        : site.status === 'DRAFT'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {site.status}
                    </span>
                    <div className="ml-4 text-sm text-gray-500">
                      {formatDistanceToNow(site.createdAt, { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}