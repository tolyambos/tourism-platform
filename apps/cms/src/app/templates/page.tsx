import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { prisma } from "@tourism/database";
import { Plus, FileCode, Calendar, Settings, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function TemplatesPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const templates = await prisma.template.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { sections: true }
      }
    }
  });

  // Group templates by type
  const cityTemplates = templates.filter(t => 
    ['hero-banner', 'attraction-grid', 'content-feature', 'testimonial-carousel', 'faq', 'cta-section'].includes(t.name)
  );
  
  const attractionTemplates = templates.filter(t => 
    ['attraction-hero', 'quick-info-bar', 'product-cards', 'tabbed-info', 'reviews-carousel', 'faq-accordion', 'final-cta'].includes(t.name)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage content templates and their schemas
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/templates/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Template
            </Link>
          </div>
        </div>

        {/* City Templates */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">City Website Templates</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {cityTemplates.length === 0 ? (
                <li className="px-4 py-4 text-sm text-gray-500">No city templates found</li>
              ) : (
                cityTemplates.map((template) => (
                  <li key={template.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FileCode className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {template.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Component: {template.componentName}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Settings className="h-4 w-4 mr-1" />
                            {template._count.sections} sections
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDistanceToNow(template.createdAt, { addSuffix: true })}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            template.isActive 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <Link
                            href={`/templates/${template.id}`}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 border border-transparent hover:bg-indigo-100"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Attraction Templates */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Attraction Website Templates</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {attractionTemplates.length === 0 ? (
                <li className="px-4 py-4 text-sm text-gray-500">No attraction templates found</li>
              ) : (
                attractionTemplates.map((template) => (
                  <li key={template.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <FileCode className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {template.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Component: {template.componentName}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Settings className="h-4 w-4 mr-1" />
                            {template._count.sections} sections
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDistanceToNow(template.createdAt, { addSuffix: true })}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            template.isActive 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <Link
                            href={`/templates/${template.id}`}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 border border-transparent hover:bg-indigo-100"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}