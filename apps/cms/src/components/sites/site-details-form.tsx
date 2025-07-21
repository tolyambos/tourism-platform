'use client';

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

interface SiteDetailsFormProps {
  siteType: 'CITY' | 'ATTRACTION';
  onSubmit: (details: any) => void;
  onBack: () => void;
}

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ru', name: 'Russian' },
];

export function SiteDetailsForm({ siteType, onSubmit, onBack }: SiteDetailsFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    languages: ['en'],
    defaultLanguage: 'en',
    locationContext: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) {
      newErrors.name = 'Site name is required';
    }
    
    if (!formData.subdomain) {
      newErrors.subdomain = 'Subdomain is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
      newErrors.subdomain = 'Subdomain can only contain lowercase letters, numbers, and hyphens';
    }
    
    if (!formData.locationContext) {
      newErrors.locationContext = 'Location context is required for AI content generation';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleSubdomainChange = (value: string) => {
    // Auto-format subdomain
    const formatted = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    setFormData({ ...formData, subdomain: formatted });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Site Details</h2>
          <p className="text-gray-600 mt-1">
            Configure the basic information for your {siteType.toLowerCase()} tourism site
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back
        </button>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Site Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder={siteType === 'CITY' ? 'e.g., Visit Barcelona' : 'e.g., Sagrada Familia Tours'}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
          Subdomain
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            id="subdomain"
            value={formData.subdomain}
            onChange={(e) => handleSubdomainChange(e.target.value)}
            className="flex-1 rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={siteType === 'CITY' ? 'barcelona' : 'sagrada-familia'}
          />
          <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
            .tourism-platform.com
          </span>
        </div>
        {errors.subdomain && <p className="mt-1 text-sm text-red-600">{errors.subdomain}</p>}
      </div>

      <div>
        <label htmlFor="locationContext" className="block text-sm font-medium text-gray-700">
          Location Context
        </label>
        <textarea
          id="locationContext"
          rows={3}
          value={formData.locationContext}
          onChange={(e) => setFormData({ ...formData, locationContext: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder={
            siteType === 'CITY'
              ? 'e.g., Barcelona, Spain - A vibrant Mediterranean city known for Gaudí architecture, beaches, tapas, and football'
              : 'e.g., Sagrada Familia - Gaudí\'s unfinished masterpiece basilica in Barcelona, featuring unique architecture and stunning facades'
          }
        />
        <p className="mt-1 text-xs text-gray-500">
          Provide context about the location to help AI generate relevant content
        </p>
        {errors.locationContext && <p className="mt-1 text-sm text-red-600">{errors.locationContext}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Languages
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AVAILABLE_LANGUAGES.map((lang) => (
            <label key={lang.code} className="flex items-center">
              <input
                type="checkbox"
                value={lang.code}
                checked={formData.languages.includes(lang.code)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      languages: [...formData.languages, lang.code],
                    });
                  } else if (formData.languages.length > 1) {
                    setFormData({
                      ...formData,
                      languages: formData.languages.filter((l) => l !== lang.code),
                    });
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">{lang.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="defaultLanguage" className="block text-sm font-medium text-gray-700">
          Default Language
        </label>
        <select
          id="defaultLanguage"
          value={formData.defaultLanguage}
          onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {formData.languages.map((langCode) => {
            const lang = AVAILABLE_LANGUAGES.find((l) => l.code === langCode);
            return (
              <option key={langCode} value={langCode}>
                {lang?.name}
              </option>
            );
          })}
        </select>
      </div>

      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Continue to Content Generation
        </button>
      </div>
    </form>
  );
}