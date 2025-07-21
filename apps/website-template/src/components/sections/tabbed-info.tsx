'use client';

import { useState } from 'react';
import Image from 'next/image';

interface TabbedInfoProps {
  content: {
    sectionTitle: string;
    sectionDescription: string;
    badgeText: string;
    tabs: {
      overview: {
        title: string;
        content: string;
        highlights: {
          value: string;
          label: string;
        }[];
        whyChooseUs: {
          title: string;
          reasons: {
            title: string;
            description: string;
          }[];
        };
      };
      essentialInfo: {
        knowBeforeYouGo: {
          categories: {
            title: string;
            items: string[];
          }[];
        };
        notAllowed: string[];
        additionalInfo: {
          accessibility?: string;
          ageRestrictions?: string;
          weatherInfo?: string;
          languageSupport?: string;
          bestSeasons?: string[];
          clothingRecommendations?: string[];
        };
      };
      planning: {
        bookingTips?: string[];
        whatToBring?: string[];
        bestSeasonsToVisit?: string;
        clothingRecommendations?: string;
      };
      moreInfo: {
        historicalContext?: string;
        photographyTips?: string | string[];
        insiderTips?: string[];
        funFacts?: string[];
        cancellationPolicy?: string;
        socialMediaHashtags?: string[];
      };
    };
    showcaseImages?: {
      image1?: string;
      image2?: string;
      image3?: string;
    };
  };
}

export default function TabbedInfo({ content }: TabbedInfoProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabButtons = [
    { id: 'overview', label: 'Overview' },
    { id: 'essential-info', label: 'Essential Info' },
    { id: 'planning', label: 'Planning' },
    { id: 'more-info', label: 'More Info' },
  ];

  return (
    <section id="tour-info" className="py-8 bg-gray-50 md:py-16">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-6 text-center md:mb-12">
          <span className="inline-block px-4 py-1 mb-4 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
            {content.badgeText}
          </span>
          <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">{content.sectionTitle}</h2>
          <p className="mx-auto max-w-2xl text-gray-600">{content.sectionDescription}</p>
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
                {/* Quick Overview */}
                <div className={`relative overflow-hidden rounded-xl ${content.showcaseImages?.image1 ? 'text-white' : 'text-gray-900'}`}>
                  {content.showcaseImages?.image1 && (
                    <>
                      <div className="absolute inset-0">
                        <Image
                          src={content.showcaseImages.image1}
                          alt="Overview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/40" />
                      </div>
                    </>
                  )}
                  
                  <div className="relative z-10 p-4 md:p-12">
                    <h3 className="mb-4 text-xl font-bold">{content.tabs.overview.title}</h3>
                    <p className={`mb-8 text-xs leading-relaxed ${content.showcaseImages?.image1 ? 'text-white/90' : 'text-gray-600'}`}>
                      {content.tabs.overview.content}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {content.tabs.overview.highlights.map((highlight, index) => (
                        <div key={index} className={`text-center p-4 rounded-lg ${
                          content.showcaseImages?.image1 
                            ? 'bg-white/10 backdrop-blur-sm border border-white/20' 
                            : 'bg-white shadow-sm'
                        }`}>
                          <div className={`mb-1 text-lg font-bold ${
                            content.showcaseImages?.image1 ? 'text-white' : 'text-blue-600'
                          }`}>{highlight.value}</div>
                          <div className={`text-sm ${
                            content.showcaseImages?.image1 ? 'text-white/80' : 'text-gray-600'
                          }`}>{highlight.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Why Choose Us */}
                <div>
                  <h4 className="mb-4 text-xl font-bold text-gray-900">{content.tabs.overview.whyChooseUs.title}</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    {content.tabs.overview.whyChooseUs.reasons.map((reason, index) => (
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
              </div>
            )}

            {/* Essential Info Tab */}
            {activeTab === 'essential-info' && (
              <div className="space-y-8">
                <h3 className="mb-6 text-2xl font-bold text-gray-900">Essential Information</h3>

                {/* Know Before You Go */}
                <div>
                  <h4 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                    <svg className="mr-2 w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Know Before You Go
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    {content.tabs.essentialInfo.knowBeforeYouGo.categories.map((category, index) => (
                      <div key={index} className="p-4 bg-amber-50 rounded-xl">
                        <h5 className="mb-3 font-semibold text-amber-900">{category.title}</h5>
                        <div className="space-y-2">
                          {category.items.map((item, itemIndex) => (
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
                </div>

                {/* Not Allowed */}
                <div className="p-5 bg-red-50 rounded-xl">
                  <h4 className="flex items-center mb-4 text-lg font-semibold text-red-900">
                    <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"/>
                    </svg>
                    Not Allowed
                  </h4>
                  <div className="space-y-2">
                    {content.tabs.essentialInfo.notAllowed.map((item, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <svg className="flex-shrink-0 mt-0.5 w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                        <span className="text-sm text-red-800">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Info Grid */}
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {content.tabs.essentialInfo.additionalInfo.accessibility && (
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <div className="flex gap-2 items-center mb-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                        <h5 className="font-semibold text-purple-900">Accessibility</h5>
                      </div>
                      <p className="text-sm text-purple-800">{content.tabs.essentialInfo.additionalInfo.accessibility}</p>
                    </div>
                  )}

                  {content.tabs.essentialInfo.additionalInfo.ageRestrictions && (
                    <div className="p-4 bg-indigo-50 rounded-xl">
                      <div className="flex gap-2 items-center mb-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <h5 className="font-semibold text-indigo-900">Age Requirements</h5>
                      </div>
                      <p className="text-sm text-indigo-800">{content.tabs.essentialInfo.additionalInfo.ageRestrictions}</p>
                    </div>
                  )}

                  {content.tabs.essentialInfo.additionalInfo.clothingRecommendations && (
                    <div className="p-4 bg-pink-50 rounded-xl">
                      <div className="flex gap-2 items-center mb-2">
                        <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                        </svg>
                        <h5 className="font-semibold text-pink-900">What to Wear</h5>
                      </div>
                      <ul className="space-y-1 text-sm text-pink-800">
                        {content.tabs.essentialInfo.additionalInfo.clothingRecommendations.map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Showcase Image 2 */}
                {content.showcaseImages?.image2 && (
                  <div className="overflow-hidden mt-8 rounded-xl shadow-lg">
                    <div className="relative h-64 md:h-96">
                      <Image
                        src={content.showcaseImages.image2}
                        alt="Essential Information"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Planning Tab */}
            {activeTab === 'planning' && (
              <div className="space-y-6">
                {content.tabs.planning.bookingTips && (
                  <div className="p-6 bg-blue-50 rounded-xl">
                    <h3 className="flex items-center mb-4 text-lg font-semibold text-blue-900">
                      <svg className="mr-3 w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                      Booking Tips
                    </h3>
                    <ul className="space-y-2">
                      {content.tabs.planning.bookingTips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-blue-600">•</span>
                          <span className="text-sm text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {content.tabs.planning.whatToBring && (
                  <div className="p-6 bg-indigo-50 rounded-xl">
                    <h3 className="flex items-center mb-4 text-lg font-semibold text-indigo-900">
                      <svg className="mr-3 w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      What to Bring
                    </h3>
                    <ul className="space-y-2">
                      {content.tabs.planning.whatToBring.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-indigo-600">•</span>
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Showcase Image 3 */}
                {content.showcaseImages?.image3 && (
                  <div className="overflow-hidden mt-8 rounded-xl shadow-lg">
                    <div className="relative h-64 md:h-96">
                      <Image
                        src={content.showcaseImages.image3}
                        alt="Planning"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* More Info Tab */}
            {activeTab === 'more-info' && (
              <div className="space-y-6">
                {content.tabs.moreInfo.historicalContext && (
                  <div className="p-6 bg-purple-50 rounded-xl">
                    <h3 className="flex items-center mb-4 text-lg font-semibold text-purple-900">
                      <svg className="mr-3 w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                      </svg>
                      Historical Context
                    </h3>
                    <p className="text-sm text-gray-700">{content.tabs.moreInfo.historicalContext}</p>
                  </div>
                )}

                {content.tabs.moreInfo.insiderTips && (
                  <div className="p-6 bg-indigo-50 rounded-xl">
                    <h3 className="flex items-center mb-4 text-lg font-semibold text-indigo-900">
                      <svg className="mr-3 w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Insider Tips
                    </h3>
                    <ul className="space-y-2">
                      {content.tabs.moreInfo.insiderTips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-indigo-600">•</span>
                          <span className="text-sm text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {content.tabs.moreInfo.funFacts && (
                  <div className="p-6 bg-yellow-50 rounded-xl">
                    <h3 className="flex items-center mb-4 text-lg font-semibold text-yellow-900">
                      <svg className="mr-3 w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                      </svg>
                      Fun Facts
                    </h3>
                    <ul className="space-y-2">
                      {content.tabs.moreInfo.funFacts.map((fact, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-yellow-600">•</span>
                          <span className="text-sm text-gray-700">{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}