import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Header } from "@/components/header";
import { prisma } from "@tourism/database";
import { ArrowLeft, Globe, Languages, Shield, Trash2 } from "lucide-react";
import { updateSiteSettings } from "./actions";

interface PageProps {
  params: Promise<{ siteId: string }>;
}

export default async function SiteSettingsPage({ params }: PageProps) {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const { siteId } = await params;

  const site = await prisma.site.findUnique({
    where: { id: siteId }
  });

  if (!site) {
    notFound();
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure settings for {site.name}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* General Settings */}
          <form action={updateSiteSettings.bind(null, site.id)}>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <Globe className="inline h-5 w-5 mr-2 text-gray-400" />
                General Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="site-name" className="block text-sm font-medium text-gray-700">
                    Site Name
                  </label>
                  <input
                    type="text"
                    id="site-name"
                    name="site-name"
                    defaultValue={site.name}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
                    Subdomain
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      id="subdomain"
                      name="subdomain"
                      defaultValue={site.subdomain}
                      className="flex-1 rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                      .tourism-platform.com
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="custom-domain" className="block text-sm font-medium text-gray-700">
                    Custom Domain (Optional)
                  </label>
                  <input
                    type="text"
                    id="custom-domain"
                    name="custom-domain"
                    placeholder="www.example.com"
                    defaultValue={site.domain || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Add your domain&apos;s CNAME record pointing to {site.subdomain}.tourism-platform.com
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Type
                  </label>
                  <p className="text-sm text-gray-900">
                    {site.type === 'CITY' ? 'City Tourism Site' : 'Single Attraction Site'}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Site type cannot be changed after creation
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Save All Settings
                </button>
              </div>
            </div>
          </div>

          {/* Language Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <Languages className="inline h-5 w-5 mr-2 text-gray-400" />
                Language Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Language
                  </label>
                  <select
                    name="default-language"
                    defaultValue={site.defaultLanguage}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="ja">Japanese</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supported Languages
                  </label>
                  <div className="space-y-2">
                    {['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh'].map(lang => (
                      <label key={lang} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`lang-${lang}`}
                          defaultChecked={site.languages.includes(lang)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {lang === 'en' ? 'English' :
                           lang === 'es' ? 'Spanish' :
                           lang === 'fr' ? 'French' :
                           lang === 'de' ? 'German' :
                           lang === 'it' ? 'Italian' :
                           lang === 'pt' ? 'Portuguese' :
                           lang === 'ja' ? 'Japanese' :
                           'Chinese'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <Shield className="inline h-5 w-5 mr-2 text-gray-400" />
                Advanced Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Status
                  </label>
                  <select
                    name="status"
                    defaultValue={site.status}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Control whether your site is accessible to visitors
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">SEO Settings</h4>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="meta-title" className="block text-sm text-gray-700">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        id="meta-title"
                        name="meta-title"
                        defaultValue={(site.seoSettings as Record<string, unknown> | undefined)?.title as string || ''}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="meta-description" className="block text-sm text-gray-700">
                        Meta Description
                      </label>
                      <textarea
                        id="meta-description"
                        name="meta-description"
                        rows={3}
                        defaultValue={(site.seoSettings as Record<string, unknown> | undefined)?.description as string || ''}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="mt-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          id="noindex"
                          name="noindex"
                          defaultChecked={(site.seoSettings as Record<string, unknown> | undefined)?.noindex as boolean || false}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Prevent search engines from indexing this site (noindex, nofollow)
                        </span>
                      </label>
                      <p className="mt-1 ml-6 text-xs text-gray-500">
                        Enable this during development or for private sites
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          </form>

          {/* Danger Zone */}
          <div className="bg-white shadow rounded-lg border border-red-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-red-900 mb-4">
                <Trash2 className="inline h-5 w-5 mr-2 text-red-400" />
                Danger Zone
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Delete Site</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Once you delete a site, there is no going back. Please be certain.
                  </p>
                  <button className="mt-3 inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    Delete This Site
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}