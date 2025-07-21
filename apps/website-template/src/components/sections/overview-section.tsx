import Image from 'next/image';

interface KeyFact {
  label: string;
  value: string;
}

interface OverviewSectionProps {
  content: {
    title: string;
    introduction: string;
    keyFacts: KeyFact[];
    imagePrompts?: string[];
    images?: string[];
  };
}

export default function OverviewSection({ content }: OverviewSectionProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {content.title || 'Overview'}
            </h2>
            
            <div className="prose prose-lg max-w-none text-gray-600 mb-8">
              <p>{content.introduction}</p>
            </div>
            
            {/* Images Grid */}
            {content.images && content.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {content.images.slice(0, 2).map((image, index) => (
                  <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                      src={image.startsWith('http') ? image : `/api/placeholder?text=Image${index + 1}`}
                      alt={`Overview image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Key Facts Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Facts</h3>
              
              <div className="space-y-4">
                {content.keyFacts?.map((fact, index) => (
                  <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                    <p className="text-sm text-gray-600 mb-1">{fact.label}</p>
                    <p className="font-semibold text-gray-900">{fact.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}