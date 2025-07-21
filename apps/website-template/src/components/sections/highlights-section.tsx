import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

interface Highlight {
  title: string;
  description: string;
  imagePrompt?: string;
  image?: string;
  details: string[];
}

interface HighlightsSectionProps {
  content: {
    sectionTitle: string;
    sectionDescription: string;
    highlights: Highlight[];
  };
}

export default function HighlightsSection({ content }: HighlightsSectionProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content.sectionTitle || 'Highlights'}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {content.sectionDescription || 'Discover the best experiences'}
          </p>
        </div>

        <div className="space-y-16">
          {content.highlights?.map((highlight, index) => (
            <div 
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {highlight.title}
                </h3>
                
                <p className="text-gray-600 mb-6">
                  {highlight.description}
                </p>
                
                <div className="space-y-3">
                  {highlight.details?.map((detail, idx) => (
                    <div key={idx} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={`relative h-96 rounded-lg overflow-hidden shadow-lg ${
                index % 2 === 1 ? 'lg:order-1' : ''
              }`}>
                <Image
                  src={highlight.image || `/api/placeholder?text=${encodeURIComponent(highlight.title)}`}
                  alt={highlight.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}