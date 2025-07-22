import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Header } from "@/components/header";

export default async function AnalyticsPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics</h1>
          <div className="bg-white shadow rounded-lg p-8">
            <p className="text-gray-600 text-center">
              Analytics dashboard coming soon. Track your site performance, visitor metrics, and more.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}