import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Header } from "../../components/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentSites } from "@/components/dashboard/recent-sites";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { getDashboardStats, getRecentSites, getSiteGrowth } from "@/lib/services/dashboard";
import { Globe, FileText, Eye, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Fetch dashboard data
  const [stats, recentSites, growth] = await Promise.all([
    getDashboardStats(),
    getRecentSites(5),
    getSiteGrowth(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back, {user.firstName || 'User'}! Here&apos;s an overview of your tourism platform.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Sites"
            value={stats.totalSites}
            icon={<Globe className="h-6 w-6" />}
            trend={growth.growth ? { value: growth.growth, isPositive: growth.isPositive } : undefined}
          />
          <StatsCard
            title="Published Sites"
            value={stats.publishedSites}
            icon={<FileText className="h-6 w-6" />}
          />
          <StatsCard
            title="Total Views"
            value={stats.totalViews.toLocaleString()}
            icon={<Eye className="h-6 w-6" />}
          />
          <StatsCard
            title="Active Rate"
            value={`${stats.totalSites > 0 ? Math.round((stats.publishedSites / stats.totalSites) * 100) : 0}%`}
            icon={<TrendingUp className="h-6 w-6" />}
          />
        </div>

        {/* Recent Sites */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentSites sites={recentSites} />
          </div>
          
          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Status</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Active Users</dt>
                  <dd className="text-sm font-medium text-gray-900">1</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">API Status</dt>
                  <dd className="text-sm font-medium text-green-600">Operational</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Storage Used</dt>
                  <dd className="text-sm font-medium text-gray-900">0 GB / 100 GB</dd>
                </div>
              </dl>
            </div>

            <div className="bg-indigo-600 shadow rounded-lg p-6 text-white">
              <h3 className="text-lg font-medium mb-2">Pro Tip</h3>
              <p className="text-sm">
                Use AI-powered content generation to create compelling tourism websites in minutes!
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </main>
    </div>
  );
}