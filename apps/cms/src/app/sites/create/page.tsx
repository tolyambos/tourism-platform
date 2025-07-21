'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { SiteTypeSelector } from '@/components/sites/site-type-selector';
import { SiteDetailsForm } from '@/components/sites/site-details-form';
import { ContentGeneration } from '@/components/sites/content-generation';
import { DeploymentStep } from '@/components/sites/deployment-step';
import { ProgressIndicator } from '@/components/sites/progress-indicator';

const steps = [
  { id: 1, name: 'Site Type', description: 'Choose your site type' },
  { id: 2, name: 'Details', description: 'Basic information' },
  { id: 3, name: 'Content', description: 'AI content generation' },
  { id: 4, name: 'Deploy', description: 'Launch your site' },
];

export default function CreateSitePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [siteData, setSiteData] = useState({
    type: null as 'CITY' | 'ATTRACTION' | null,
    name: '',
    subdomain: '',
    languages: ['en'],
    defaultLanguage: 'en',
  });
  const [siteId, setSiteId] = useState<string | null>(null);
  const router = useRouter();

  const handleTypeSelect = (type: 'CITY' | 'ATTRACTION') => {
    setSiteData({ ...siteData, type });
    setCurrentStep(2);
  };

  const handleDetailsSubmit = async (details: any) => {
    setSiteData({ ...siteData, ...details });
    
    // Create site in database
    try {
      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...siteData,
          ...details,
        }),
      });
      
      if (response.ok) {
        const { site } = await response.json();
        setSiteId(site.id);
        setCurrentStep(3);
      }
    } catch (error) {
      console.error('Error creating site:', error);
    }
  };

  const handleContentGenerated = () => {
    setCurrentStep(4);
  };

  const handleDeployComplete = () => {
    router.push(`/sites/${siteId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Site</h1>
          <p className="mt-2 text-sm text-gray-600">
            Follow the steps below to create your AI-powered tourism website
          </p>
        </div>

        <ProgressIndicator steps={steps} currentStep={currentStep} />

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          {currentStep === 1 && (
            <SiteTypeSelector onSelect={handleTypeSelect} />
          )}
          
          {currentStep === 2 && (
            <SiteDetailsForm 
              siteType={siteData.type!}
              onSubmit={handleDetailsSubmit}
              onBack={() => setCurrentStep(1)}
            />
          )}
          
          {currentStep === 3 && siteId && (
            <ContentGeneration 
              siteId={siteId}
              onComplete={handleContentGenerated}
              onBack={() => setCurrentStep(2)}
            />
          )}
          
          {currentStep === 4 && siteId && (
            <DeploymentStep 
              siteId={siteId}
              onComplete={handleDeployComplete}
              onBack={() => setCurrentStep(3)}
            />
          )}
        </div>
      </main>
    </div>
  );
}