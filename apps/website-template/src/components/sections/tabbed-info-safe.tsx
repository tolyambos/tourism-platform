'use client';

import { useState } from 'react';
import Image from 'next/image';

interface TabbedInfoProps {
  content: any; // Accept any content structure
}

// Default content structure
const defaultContent = {
  sectionTitle: 'Complete Experience Guide',
  sectionDescription: 'All the details you need in one place',
  badgeText: 'Everything You Need',
  tabs: {
    overview: {
      title: 'Overview',
      content: 'Experience overview will be available soon.',
      highlights: [],
      whyChooseUs: {
        title: 'Why Choose This Experience',
        reasons: []
      }
    },
    essentialInfo: {
      knowBeforeYouGo: {
        categories: []
      },
      notAllowed: [],
      additionalInfo: {}
    },
    planning: {
      bookingTips: [],
      whatToBring: [],
      bestSeasonsToVisit: '',
      clothingRecommendations: ''
    },
    moreInfo: {
      historicalContext: '',
      photographyTips: [],
      insiderTips: [],
      funFacts: [],
      cancellationPolicy: '',
      socialMediaHashtags: []
    }
  },
  showcaseImages: {}
};

// Deep merge function to combine default and actual content
function deepMerge(target: any, source: any): any {
  if (!source) return target;
  
  const output = { ...target };
  
  Object.keys(source).forEach(key => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  });
  
  return output;
}

export default function TabbedInfo({ content = {} }: TabbedInfoProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Merge provided content with defaults
  const safeContent = deepMerge(defaultContent, content);

  const tabButtons = [
    { id: 'overview', label: 'Overview' },
    { id: 'essential-info', label: 'Essential Info' },
    { id: 'planning', label: 'Planning' },
    { id: 'more-info', label: 'More Info' },
  ];

  // If no content at all, show a placeholder
  if (!content || Object.keys(content).length === 0) {
    return (
      <section id="tour-info" className="py-8 bg-gray-50 md:py-16">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center p-12 bg-white rounded-xl shadow-sm">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Information Coming Soon</h3>
            <p className="text-gray-600">Detailed information about this experience will be available shortly.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="tour-info" className="py-8 bg-gray-50 md:py-16">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-6 text-center md:mb-12">
          <span className="inline-block px-4 py-1 mb-4 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
            {safeContent.badgeText}
          </span>
          <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">{safeContent.sectionTitle}</h2>
          <p className="mx-auto max-w-2xl text-gray-600">{safeContent.sectionDescription}</p>
        </div>

        {/* Tab Navigation */}
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex gap-2 p-2 bg-gray-100 rounded-xl overflow-x-auto">
            {tabButtons.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-3 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-md'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="p-8 bg-white rounded-2xl shadow-sm">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="relative overflow-hidden rounded-xl p-8 bg-gray-50">
                  <h3 className="mb-4 text-xl font-bold text-gray-900">
                    {safeContent.tabs.overview.title || 'Overview'}
                  </h3>
                  <p className="text-gray-600">
                    {safeContent.tabs.overview.content || 'Experience overview coming soon.'}
                  </p>
                  
                  {safeContent.tabs.overview.highlights && safeContent.tabs.overview.highlights.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-8 md:grid-cols-4">
                      {safeContent.tabs.overview.highlights.map((highlight: any, index: number) => (
                        <div key={index} className="text-center bg-white p-4 rounded-lg shadow-sm">
                          <div className="text-lg font-bold text-blue-600">{highlight.value}</div>
                          <div className="text-sm text-gray-600">{highlight.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {safeContent.tabs.overview.whyChooseUs && 
                 safeContent.tabs.overview.whyChooseUs.reasons && 
                 safeContent.tabs.overview.whyChooseUs.reasons.length > 0 && (
                  <div>
                    <h4 className="mb-4 text-xl font-bold text-gray-900">
                      {safeContent.tabs.overview.whyChooseUs.title}
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {safeContent.tabs.overview.whyChooseUs.reasons.map((reason: any, index: number) => (
                        <div key={index} className="flex gap-4">
                          <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                          </div>
                          <div>
                            <h5 className="mb-1 font-semibold text-gray-900">{reason.title}</h5>
                            <p className="text-sm text-gray-600">{reason.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Essential Info Tab */}
            {activeTab === 'essential-info' && (
              <div className="space-y-6">
                <h3 className="mb-6 text-2xl font-bold text-gray-900">Essential Information</h3>
                
                {safeContent.tabs.essentialInfo.knowBeforeYouGo.categories.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {safeContent.tabs.essentialInfo.knowBeforeYouGo.categories.map((category: any, index: number) => (
                      <div key={index} className="p-4 bg-amber-50 rounded-xl">
                        <h5 className="mb-3 font-semibold text-amber-900">{category.title}</h5>
                        <div className="space-y-2">
                          {category.items.map((item: string, itemIndex: number) => (
                            <div key={itemIndex} className="flex gap-2 items-start">
                              <svg className="flex-shrink-0 mt-0.5 w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                              </svg>
                              <span className="text-sm text-amber-800">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Essential information will be available soon.</p>
                )}
              </div>
            )}

            {/* Planning Tab */}
            {activeTab === 'planning' && (
              <div className="space-y-6">
                <h3 className="mb-6 text-2xl font-bold text-gray-900">Planning Your Visit</h3>
                {safeContent.tabs.planning.bookingTips.length > 0 ||
                 safeContent.tabs.planning.whatToBring.length > 0 ? (
                  <div className="space-y-6">
                    {safeContent.tabs.planning.bookingTips.length > 0 && (
                      <div className="p-6 bg-blue-50 rounded-xl">
                        <h4 className="mb-4 text-lg font-semibold text-blue-900">Booking Tips</h4>
                        <ul className="space-y-2">
                          {safeContent.tabs.planning.bookingTips.map((tip: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2 text-blue-600">•</span>
                              <span className="text-sm text-gray-700">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">Planning information will be available soon.</p>
                )}
              </div>
            )}

            {/* More Info Tab */}
            {activeTab === 'more-info' && (
              <div className="space-y-6">
                <h3 className="mb-6 text-2xl font-bold text-gray-900">Additional Information</h3>
                <p className="text-gray-600">More detailed information will be available soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}