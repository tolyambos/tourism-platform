import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { prisma } from "@tourism/database";
import { Plus, Globe, Calendar, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SiteActions } from "@/components/site-actions";

export default async function SitesPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const sites = await prisma.site.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { pages: true }
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sites</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage all your tourism websites in one place
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/sites/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Site
            </Link>
          </div>
        </div>

        {sites.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Globe className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sites yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first tourism website.
            </p>
            <div className="mt-6">
              <Link
                href="/sites/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Site
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {sites.map((site) => (
                <li key={site.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between mb-3">
                      <Link href={`/sites/${site.id}`} className="flex items-center hover:opacity-80">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Globe className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {site.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {site.domain || `${site.subdomain}.tourism-platform.com`}
                          </div>
                        </div>
                      </Link>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Eye className="h-4 w-4 mr-1" />
                          {site._count.pages} pages
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDistanceToNow(site.createdAt, { addSuffix: true })}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          site.status === 'PUBLISHED' 
                            ? 'bg-green-100 text-green-800'
                            : site.status === 'DRAFT'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {site.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Link 
                        href={`/sites/${site.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                      >
                        Edit Site →
                      </Link>
                      <SiteActions 
                        siteId={site.id}
                        subdomain={site.subdomain}
                        domain={site.domain}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}