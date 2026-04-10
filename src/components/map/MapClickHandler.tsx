"use client";

import { useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';

interface MapClickHandlerProps {
  onMapClick: (latlng: LatLng) => void;
}

export default function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}
