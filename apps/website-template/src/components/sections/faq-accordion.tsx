'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  content: {
    sectionTitle: string;
    sectionDescription: string;
    badgeText: string;
    faqs: FAQItem[];
  };
}

export default function FAQAccordion({ content }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-8 bg-gray-50 md:py-16">
      <div className="px-4 mx-auto max-w-3xl sm:px-6 lg:px-8">
        <div className="mb-6 text-center md:mb-12">
          <span className="inline-block px-4 py-1 mb-4 text-sm font-medium text-green-700 bg-green-100 rounded-full">
            {content.badgeText}
          </span>
          <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">{content.sectionTitle}</h2>
          <p className="text-gray-600">{content.sectionDescription}</p>
        </div>

        <div className="space-y-3">
          {content.faqs.map((faq, index) => (
            <div key={index} className="overflow-hidden bg-white rounded-xl">
              <button 
                onClick={() => toggleFAQ(index)}
                className="flex justify-between items-center px-6 py-4 w-full text-left transition-colors hover:bg-gray-50 focus:outline-none"
              >
                <span className="pr-4 text-sm font-semibold text-gray-900">{faq.question}</span>
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
              <div className={`${openIndex === index ? 'block' : 'hidden'} px-6 py-4`}>
                <p className="text-sm leading-relaxed text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}