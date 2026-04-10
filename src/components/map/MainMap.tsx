"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// Wrapper to handle SSR-safe Map loading
const MapContent = dynamic(() => import('./MapContent'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium font-sans">Зареждане на картата...</p>
      </div>
    </div>
  ),
});

interface MainMapProps {
  initialLocations: any[];
}

export default function MainMap({ initialLocations }: MainMapProps) {
  return <MapContent initialLocations={initialLocations} />;
}
