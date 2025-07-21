import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Header } from "@/components/header";
import { prisma } from "@tourism/database";
import { ArrowLeft } from "lucide-react";
import { EditorClient } from "./editor-client";

interface PageProps {
  params: Promise<{ siteId: string }>;
}

export default async function ContentEditorPage({ params }: PageProps) {
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
          sections: {
            include: {
              template: true,
              content: {
                where: { language: 'en' }, // Default to English
                take: 1
              }
            },
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  });

  if (!site) {
    notFound();
  }

  const homePage = site.pages.find(p => p.type === 'HOME');

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
            <h1 className="text-3xl font-bold text-gray-900">Content Editor</h1>
            <p className="mt-1 text-sm text-gray-500">
              Edit content for {site.name}
            </p>
          </div>
        </div>

        <EditorClient site={site} homePage={homePage} />
      </main>
    </div>
  );
}