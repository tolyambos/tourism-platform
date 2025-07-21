import { 
  Clock, MapPin, Ticket, Calendar, Accessibility, 
  Info, Phone, Mail, Globe, Car
} from 'lucide-react';

const iconMap: Record<string, any> = {
  clock: Clock,
  location: MapPin,
  ticket: Ticket,
  calendar: Calendar,
  accessibility: Accessibility,
  info: Info,
  phone: Phone,
  mail: Mail,
  globe: Globe,
  car: Car
};

interface InfoItem {
  label: string;
  value: string;
}

interface InfoCategory {
  title: string;
  icon?: string;
  items: InfoItem[];
}

interface InfoSectionProps {
  content: {
    sectionTitle: string;
    categories: InfoCategory[];
  };
}

export default function InfoSection({ content }: InfoSectionProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
          {content.sectionTitle || 'Practical Information'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.categories?.map((category, index) => {
            const Icon = category.icon ? iconMap[category.icon] || Info : Info;
            
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    {category.title}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {category.items?.map((item, idx) => (
                    <div key={idx} className="border-b border-gray-100 pb-2 last:border-0">
                      <p className="text-sm text-gray-600">{item.label}</p>
                      <p className="font-medium text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}