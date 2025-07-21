'use client';

import { Cloud, CloudRain, Sun, CloudSnow, Wind } from 'lucide-react';

// Mock weather component - in production, this would fetch real weather data
export default function WeatherWidget({ content }: any) {
  return (
    <div className="bg-blue-50 rounded-lg p-6 max-w-sm mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Weather</h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">22°C</p>
          <p className="text-gray-600">Partly Cloudy</p>
        </div>
        <Cloud className="w-16 h-16 text-blue-500" />
      </div>
    </div>
  );
}