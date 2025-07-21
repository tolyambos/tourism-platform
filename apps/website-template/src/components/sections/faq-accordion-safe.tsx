'use client';

import { useState } from 'react';
import { getDefaultFAQContent, mergeWithDefaults } from './safe-wrappers';

interface FAQAccordionProps {
  content?: any;
}

export default function FAQAccordion({ content }: FAQAccordionProps) {
  const safeContent = mergeWithDefaults(getDefaultFAQContent(), content);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = safeContent.faqs || [];

  return (
    <section id="faq" className="py-8 bg-gray-50 md:py-16">
      <div className="px-4 mx-auto max-w-3xl sm:px-6 lg:px-8">
        <div className="mb-6 text-center md:mb-12">
          <span className="inline-block px-4 py-1 mb-4 text-sm font-medium text-green-700 bg-green-100 rounded-full">
            {safeContent.badgeText}
          </span>
          <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">{safeContent.sectionTitle}</h2>
          <p className="text-gray-600">{safeContent.sectionDescription}</p>
        </div>

        {faqs.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">No questions available at the moment. Please check back later.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq: any, index: number) => (
              <div key={index} className="overflow-hidden bg-white rounded-xl">
                <button 
                  className="flex justify-between items-center px-6 py-4 w-full text-left transition-colors hover:bg-gray-50 focus:outline-none"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="pr-4 text-sm font-semibold text-gray-900">{faq.question || 'Question'}</span>
                  <svg 
                    className={`flex-shrink-0 w-5 h-5 text-gray-400 transition-transform duration-200 transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4">
                    <p className="text-sm leading-relaxed text-gray-600">{faq.answer || 'Answer not available.'}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}