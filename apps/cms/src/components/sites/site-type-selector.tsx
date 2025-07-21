import { Building2, Mountain } from 'lucide-react';

interface SiteTypeSelectorProps {
  onSelect: (type: 'CITY' | 'ATTRACTION') => void;
}

export function SiteTypeSelector({ onSelect }: SiteTypeSelectorProps) {
  const types = [
    {
      id: 'CITY' as const,
      name: 'City Tourism',
      description: 'Perfect for showcasing entire cities, their attractions, culture, and experiences',
      icon: Building2,
      features: [
        'Multiple attraction pages',
        'City guide sections',
        'Event calendars',
        'Local experiences',
      ],
      examples: ['Barcelona Tourism', 'Visit Tokyo', 'Discover Paris'],
    },
    {
      id: 'ATTRACTION' as const,
      name: 'Single Attraction',
      description: 'Ideal for specific landmarks, museums, parks, or tourist destinations',
      icon: Mountain,
      features: [
        'Focused content',
        'Booking integration',
        'Virtual tours',
        'Visitor information',
      ],
      examples: ['Eiffel Tower', 'Grand Canyon Tours', 'Louvre Museum'],
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Site Type</h2>
      <p className="text-gray-600 mb-8">
        Select the type of tourism website you want to create. This will determine the structure and features available.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className="relative rounded-lg border-2 border-gray-300 p-6 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all group text-left"
          >
            <div className="flex items-center mb-4">
              <div className="rounded-lg bg-indigo-100 p-3 group-hover:bg-indigo-200 transition-colors">
                <type.icon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">{type.name}</h3>
            </div>
            
            <p className="text-gray-600 mb-4">{type.description}</p>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {type.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500">
                Examples: {type.examples.join(', ')}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}