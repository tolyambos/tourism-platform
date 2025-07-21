import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Header } from "@/components/header";
import { RebuildSiteButton } from "@/components/rebuild-site-button";
import { SiteActions } from "@/components/site-actions";
import { prisma } from "@tourism/database";
import { ArrowLeft, Globe, Edit, Zap, Settings } from "lucide-react";

interface PageProps {
  params: Promise<{ siteId: string }>;
}

export default async function SiteDashboardPage({ params }: PageProps) {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const { siteId } = await params;

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      pages: {
        include: {
          _count: {
            select: { sections: true }
          }
        }
      },
      deployments: {
        orderBy: { startedAt: 'desc' },
        take: 1
      }
    }
  });

  if (!site) {
    notFound();
  }

  const latestDeployment = site.deployments[0];
  const siteUrl = site.domain || `https://${site.subdomain}.tourism-platform.com`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/sites"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Sites
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{site.name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {siteUrl}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                site.status === 'PUBLISHED' 
                  ? 'bg-green-100 text-green-800'
                  : site.status === 'DRAFT'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {site.status}
              </span>
              <SiteActions 
                siteId={site.id}
                subdomain={site.subdomain}
                domain={site.domain}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link
            href={`/sites/${site.id}/editor`}
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
          >
            <div className="flex-shrink-0">
              <Edit className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Content Editor</p>
              <p className="text-sm text-gray-500">Edit pages and sections</p>
            </div>
          </Link>

          <Link
            href={`/sites/${site.id}/deploy`}
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
          >
            <div className="flex-shrink-0">
              <Zap className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Deploy</p>
              <p className="text-sm text-gray-500">Publish changes</p>
            </div>
          </Link>

          <Link
            href={`/sites/${site.id}/settings`}
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
          >
            <div className="flex-shrink-0">
              <Settings className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Settings</p>
              <p className="text-sm text-gray-500">Configure site</p>
            </div>
          </Link>

          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
          >
            <div className="flex-shrink-0">
              <Globe className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">View Site</p>
              <p className="text-sm text-gray-500">Open in new tab</p>
            </div>
          </a>

          <RebuildSiteButton siteId={site.id} siteType={site.type} />
        </div>

        {/* Site Info */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Site Information
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {site.type === 'CITY' ? 'City Tourism' : 'Single Attraction'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Languages</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {site.languages.join(', ')} (default: {site.defaultLanguage})
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Pages</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {site.pages.length} pages with {site.pages.reduce((acc, page) => acc + page._count.sections, 0)} sections
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Last Deployment</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {latestDeployment 
                    ? new Date(latestDeployment.startedAt).toLocaleString()
                    : 'Not deployed yet'
                  }
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(site.createdAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}