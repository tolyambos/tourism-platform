import { 
  MapPin, Calendar, Globe, Users, Star, Heart, 
  Camera, Sun, Moon, Cloud, Utensils, ShoppingBag,
  Train, Plane, Car, Ship, Mountain, Waves
} from 'lucide-react';

const iconMap: Record<string, any> = {
  map: MapPin,
  calendar: Calendar,
  globe: Globe,
  users: Users,
  star: Star,
  heart: Heart,
  camera: Camera,
  sun: Sun,
  moon: Moon,
  cloud: Cloud,
  food: Utensils,
  shopping: ShoppingBag,
  train: Train,
  plane: Plane,
  car: Car,
  ship: Ship,
  mountain: Mountain,
  waves: Waves
};

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface FeaturesSectionProps {
  content: {
    sectionTitle: string;
    sectionDescription: string;
    features: Feature[];
  };
}

export default function FeaturesSection({ content }: FeaturesSectionProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content.sectionTitle || 'Why Visit'}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {content.sectionDescription || 'Discover what makes this destination special'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.features?.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Star;
            
            return (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}