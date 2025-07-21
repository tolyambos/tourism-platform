'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Sparkles, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ContentGenerationProps {
  siteId: string;
  onComplete: () => void;
  onBack: () => void;
}

interface GenerationStatus {
  sectionId: string;
  name: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  error?: string;
}

export function ContentGeneration({ siteId, onComplete, onBack }: ContentGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sections, setSections] = useState<GenerationStatus[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    // Initialize sections
    const defaultSections = [
      { sectionId: 'hero', name: 'Hero Banner', status: 'pending' as const },
      { sectionId: 'attractions', name: 'Attractions Grid', status: 'pending' as const },
      { sectionId: 'features', name: 'Key Features', status: 'pending' as const },
      { sectionId: 'testimonials', name: 'Testimonials', status: 'pending' as const },
      { sectionId: 'faq', name: 'FAQ Section', status: 'pending' as const },
      { sectionId: 'cta', name: 'Call to Action', status: 'pending' as const },
    ];
    setSections(defaultSections);
  }, []);

  const startGeneration = async () => {
    setIsGenerating(true);
    
    try {
      // Start content generation
      const response = await fetch(`/api/sites/${siteId}/generate-content`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to start generation');
      
      // Simulate progressive generation
      for (let i = 0; i < sections.length; i++) {
        setSections(prev => prev.map((section, idx) => 
          idx === i ? { ...section, status: 'generating' } : section
        ));
        
        // Simulate API call for each section
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setSections(prev => prev.map((section, idx) => 
          idx === i ? { ...section, status: 'complete' } : section
        ));
        
        setOverallProgress((i + 1) / sections.length * 100);
      }
      
      // All sections complete
      setTimeout(() => {
        onComplete();
      }, 1000);
      
    } catch (error) {
      console.error('Generation error:', error);
      setSections(prev => prev.map(section => 
        section.status === 'generating' ? { ...section, status: 'error', error: 'Generation failed' } : section
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusIcon = (status: GenerationStatus['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
      case 'generating':
        return <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Content Generation</h2>
          <p className="text-gray-600 mt-1">
            Let AI create compelling content for your tourism website
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          disabled={isGenerating}
          className="flex items-center text-gray-600 hover:text-gray-900 disabled:opacity-50"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back
        </button>
      </div>

      {!isGenerating && sections.every(s => s.status === 'pending') && (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ready to Generate Content
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Our AI will create unique, SEO-optimized content for each section of your website based on your site details.
          </p>
          <button
            onClick={startGeneration}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start AI Generation
          </button>
        </div>
      )}

      {(isGenerating || sections.some(s => s.status !== 'pending')) && (
        <div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm text-gray-500">{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.sectionId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {getStatusIcon(section.status)}
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {section.name}
                  </span>
                </div>
                {section.status === 'generating' && (
                  <span className="text-sm text-gray-500">Generating...</span>
                )}
                {section.status === 'complete' && (
                  <span className="text-sm text-green-600">Complete</span>
                )}
                {section.status === 'error' && (
                  <span className="text-sm text-red-600">{section.error}</span>
                )}
              </div>
            ))}
          </div>

          {sections.every(s => s.status === 'complete') && (
            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Content Generation Complete!
                  </h3>
                  <p className="mt-2 text-sm text-green-700">
                    All sections have been successfully generated. Proceeding to deployment...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}