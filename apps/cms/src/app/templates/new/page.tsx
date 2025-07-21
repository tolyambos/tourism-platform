'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewTemplatePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    componentName: '',
    isActive: true,
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const template = await response.json();
        router.push(`/templates/${template.id}`);
      }
    } catch (error) {
      console.error('Error creating template:', error);
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/templates"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Templates
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Create New Template</h1>
          <p className="mt-1 text-sm text-gray-500">
            Define a new content template for your tourism websites
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Template Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., hero-section, product-showcase"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Use lowercase with hyphens, this will be used internally
            </p>
          </div>
          
          <div>
            <label htmlFor="componentName" className="block text-sm font-medium text-gray-700">
              Component Name
            </label>
            <input
              type="text"
              id="componentName"
              value={formData.componentName}
              onChange={(e) => setFormData({ ...formData, componentName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., HeroSection, ProductShowcase"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Use PascalCase, this should match your React component name
            </p>
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Active (template can be used for new sections)
              </span>
            </label>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <Link
                href="/templates"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isCreating}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isCreating ? 'Creating...' : 'Create Template'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}