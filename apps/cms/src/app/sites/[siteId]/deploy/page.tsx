import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Header } from "@/components/header";
import { prisma } from "@tourism/database";
import { ArrowLeft, CheckCircle, AlertCircle, Clock, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DeployButton } from "@/components/deploy/deploy-button";

interface PageProps {
  params: Promise<{ siteId: string }>;
}

export default async function DeploymentCenterPage({ params }: PageProps) {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const { siteId } = await params;

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      deployments: {
        orderBy: { startedAt: 'desc' },
        take: 10
      },
      pages: {
        include: {
          _count: {
            select: { sections: true }
          }
        }
      }
    }
  });

  if (!site) {
    notFound();
  }

  const vercelAppUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://tourism-platform-website-template.vercel.app';
  const siteUrl = `${vercelAppUrl}/en?subdomain=${site.subdomain}`;
  const hasContent = site.pages.some(p => p._count.sections > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href={`/sites/${site.id}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Site Dashboard
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deployment Center</h1>
            <p className="mt-1 text-sm text-gray-500">
              Deploy {site.name} to production
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Deploy Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Deploy to Production</h2>
              
              <div className="space-y-4">
                {/* Pre-deployment Checks */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Pre-deployment Checks</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      {hasContent ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className={`text-sm ${hasContent ? 'text-gray-700' : 'text-red-600'}`}>
                        Content generated ({site.pages.reduce((acc, p) => acc + p._count.sections, 0)} sections)
                      </span>
                    </div>
                    <div className="flex items-center">
                      {site.subdomain ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className={`text-sm ${site.subdomain ? 'text-gray-700' : 'text-red-600'}`}>
                        Subdomain configured
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        Site configuration valid
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deployment Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Deployment Details</h3>
                  <dl className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-500">Target URL:</dt>
                      <dd className="text-gray-900 font-mono">{siteUrl}</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-500">Provider:</dt>
                      <dd className="text-gray-900">Vercel</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-500">Environment:</dt>
                      <dd className="text-gray-900">Production</dd>
                    </div>
                  </dl>
                </div>

                {/* Deploy Button */}
                <div className="pt-4">
                  <DeployButton 
                    siteId={site.id}
                    hasContent={hasContent}
                    hasSubdomain={!!site.subdomain}
                  />
                </div>
              </div>
            </div>

            {/* Deployment History */}
            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Deployment History</h2>
              
              {site.deployments.length > 0 ? (
                <div className="space-y-3">
                  {site.deployments.map((deployment) => (
                    <div key={deployment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {deployment.status === 'SUCCESS' ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          ) : deployment.status === 'FAILED' ? (
                            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {deployment.environment} Deployment
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDistanceToNow(deployment.startedAt, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        {deployment.url && (
                          <a
                            href={deployment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No deployments yet.</p>
              )}
            </div>
          </div>

          {/* Deployment Guide */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Deployment Guide</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">1. Generate Content</h4>
                  <p className="text-sm text-gray-600">
                    Ensure all pages have content generated using AI or manually added.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">2. Review & Edit</h4>
                  <p className="text-sm text-gray-600">
                    Use the content editor to review and customize your content.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">3. Configure Domain</h4>
                  <p className="text-sm text-gray-600">
                    Set up your subdomain or custom domain in site settings.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">4. Deploy</h4>
                  <p className="text-sm text-gray-600">
                    Click deploy to publish your site to production.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Live Site</h3>
              {site.status === 'PUBLISHED' ? (
                <div>
                  <a
                    href={siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
                  >
                    View Live Site
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                  <p className="mt-2 text-sm text-gray-600">
                    Your site is live at:
                  </p>
                  <p className="text-sm font-mono text-gray-900 mt-1">
                    {siteUrl}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Site not yet published. Deploy to make it live.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}