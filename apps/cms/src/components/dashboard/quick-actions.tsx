import Link from 'next/link';
import { Plus, Layout, Zap, Globe } from 'lucide-react';

const actions = [
  {
    name: 'Create New Site',
    href: '/sites/create',
    icon: Plus,
    description: 'Start building a new tourism website',
    color: 'bg-indigo-500',
  },
  {
    name: 'Manage Sites',
    href: '/sites',
    icon: Layout,
    description: 'View and edit your existing sites',
    color: 'bg-purple-500',
  },
  {
    name: 'Quick Deploy',
    href: '/deploy',
    icon: Zap,
    description: 'Deploy your latest changes',
    color: 'bg-green-500',
  },
  {
    name: 'View Analytics',
    href: '/analytics',
    icon: Globe,
    description: 'Check your sites performance',
    color: 'bg-blue-500',
  },
];

export function QuickActions() {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="relative group bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div>
              <span className={`rounded-lg inline-flex p-3 ${action.color} text-white`}>
                <action.icon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                {action.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {action.description}
              </p>
            </div>
            <span
              className="absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
              aria-hidden="true"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}