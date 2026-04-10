"use client";

import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { bulgariaGeoJSON } from '@/data/bulgaria';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Search, Filter, Star, Menu, BookOpen, AlertTriangle, Shield, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MapClickHandler from './MapClickHandler';
import Link from 'next/link';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';

// Safe Icon Definitions (Hard-Icon Strategy)
// These are defined outside the component to prevent re-creation during renders
let DEFAULT_ICON: any = null;
let TRAIL_ICON: any = null;

if (typeof window !== 'undefined') {
  // Premium SVG Icon Strategy
  const createCustomIcon = (color: string) => {
    return new L.DivIcon({
      className: 'custom-div-icon',
      html: `<div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        color: white;
        transform: rotate(-10deg) translate(-1px, 1px);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };

  DEFAULT_ICON = createCustomIcon('#3b82f6'); // Blue
  TRAIL_ICON = createCustomIcon('#10b981');   // emerald-500
}

// Inverted Bulgaria Mask
const worldMask = {
  "type": "Feature" as const,
  "properties": {},
  "geometry": {
    "type": "Polygon" as const,
    "coordinates": [
      [
        [-180, -90],
        [-180, 90],
        [180, 90],
        [180, -90],
        [-180, -90]
      ],
      bulgariaGeoJSON.features[0].geometry.coordinates[0]
    ]
  }
};

const maskStyle = {
  fillColor: 'black',
  fillOpacity: 0.5,
  color: 'transparent',
  weight: 0,
};

const bulgariaStyle = {
  fillColor: 'transparent',
  color: '#047857',
  weight: 2,
  opacity: 0.5,
};

interface AmenitySet {
  water?: boolean;
  shade?: boolean;
  flatGround?: boolean;
  cellSignal?: boolean;
  firePit?: boolean;
  petFriendly?: boolean;
  toilet?: boolean;
  electricity?: boolean;
  wifi?: boolean;
}

interface Spot {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: 'wild' | 'host';
  region: string;
  imageUrl?: string | null;
  averageRating?: number | null;
  reviewsCount?: number | null;
  legalStatus?: 'tolerated' | 'approved' | 'protected' | 'strict';
  riskLevel?: 'low' | 'medium' | 'high' | 'extreme';
  amenities?: AmenitySet | null;
}

const legalStatusMap = {
  tolerated: { label: "Толерирано", bg: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  approved: { label: "Одобрено за 2026", bg: "bg-blue-50 text-blue-700 border-blue-100" },
  protected: { label: "Защитена зона", bg: "bg-orange-50 text-orange-700 border-orange-100" },
  strict: { label: "Стриктен контрол", bg: "bg-red-50 text-red-700 border-red-100" }
};

const riskLevelMap = {
  low: { label: "Нисък риск", color: "text-emerald-600" },
  medium: { label: "Среден риск", color: "text-amber-600" },
  high: { label: "Висок риск (Глоба)", color: "text-orange-600" },
  extreme: { label: "Критичен риск (Забранено)", color: "text-red-700 font-bold" }
};

interface MainMapProps {
  initialLocations: Spot[];
}

export default function MainMap({ initialLocations }: MainMapProps) {
  const [filterType, setFilterType] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number, lng: number } | null>(null);
  const { isLoaded, isSignedIn, user } = useUser();


  const filteredLocations = initialLocations.filter(loc => {
    const matchesType = filterType === 'all' || loc.type === filterType;
    const matchesRisk = filterRisk === 'all' || loc.riskLevel === filterRisk;
    const matchesSearch = !searchTerm || 
      loc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.region?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesRisk && matchesSearch;
  });

  const centerBulgaria: [number, number] = [42.7339, 25.4858];
  const maxBounds: [[number, number], [number, number]] = [
    [41.2, 22.3],
    [44.3, 28.7]
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50 font-sans">
      <div className="bg-white shadow-sm border-b z-50 relative">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-green-700 tracking-tight">🏕️ Айляк</h1>
            <div className="flex gap-3">
              <Link href="/manifesto">
                <Button variant="ghost" size="sm" className="rounded-xl">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Манифесто
                </Button>
              </Link>
              {!isSignedIn ? (
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm" className="rounded-xl border-green-200 text-green-700 bg-green-50/50 hover:bg-green-50 font-bold">
                    Вход
                  </Button>
                </SignInButton>
              ) : (
                <div className="flex items-center gap-3">
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-xl border-gray-200 shadow-sm">
                          <Menu className="w-4 h-4 mr-2" />
                          Меню
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl p-2 shadow-xl border-gray-100">
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="flex items-center w-full px-3 py-2 rounded-xl hover:bg-green-50 text-gray-700">
                            👤 Профил
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/experiences" className="flex items-center w-full px-3 py-2 rounded-xl hover:bg-green-50 text-gray-700">
                            🎯 Преживявания
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <UserButton userProfileMode="modal" />
                </div>
              )}
              <Link href="/add">
                <Button className="bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Добави преживяване
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              <Input
                placeholder="🔍 Търси хижа, екопътека или къмпинг..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-7 text-lg rounded-2xl shadow-sm border-gray-100 focus:border-green-500 bg-white placeholder:text-gray-400 font-medium transition-all"
              />
            </div>
            <div className="flex gap-2 items-center shrink-0">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[160px] h-14 rounded-2xl border-gray-100 bg-white shadow-sm font-medium">
                  <Filter className="w-4 h-4 mr-2 text-green-600" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-xl border-gray-100">
                  <SelectItem value="all">Всички типове</SelectItem>
                  <SelectItem value="wild">🏞️ Диви места</SelectItem>
                  <SelectItem value="host">🏡 Домакински</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger className="w-[160px] h-14 rounded-2xl border-gray-100 bg-white shadow-sm font-medium">
                  <Shield className="w-4 h-4 mr-2 text-orange-500" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-xl border-gray-100">
                  <SelectItem value="all">Всички нива</SelectItem>
                  <SelectItem value="low">✅ Нисък риск</SelectItem>
                  <SelectItem value="medium">⚠️ Среден риск</SelectItem>
                  <SelectItem value="high">❌ Висок риск</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <MapContainer
          center={centerBulgaria}
          zoom={8}
          minZoom={6}
          maxBounds={maxBounds}
          maxBoundsViscosity={1.0}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          <GeoJSON data={worldMask} style={maskStyle} interactive={false} />
          <GeoJSON data={bulgariaGeoJSON} style={bulgariaStyle} interactive={false} />

          <MapClickHandler onMapClick={setSelectedPosition} />
          
          {filteredLocations.map((location) => {
            const isTrail = location.name?.toLowerCase().includes('екопътека') || 
                          location.description?.toLowerCase().includes('екопътека');
            
            // Validate coordinates and icons to prevent Leaflet crashes
            if (!location.latitude || !location.longitude || !DEFAULT_ICON) return null;

            return (
              <Marker 
                key={`marker-${location.id}`} 
                position={[location.latitude, location.longitude]} 
                icon={isTrail ? TRAIL_ICON : DEFAULT_ICON}
              >
                <Popup className="custom-popup">
                  <div className="p-1 min-w-[220px]">
                    <h3 className="font-bold text-lg mb-1 text-gray-900 leading-tight">{location.name}</h3>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge variant="outline" className={location.type === 'wild' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'}>
                        {location.type === 'wild' ? '🏞️ Дивo място' : '🏡 Домакинско'}
                      </Badge>
                      {location.legalStatus && (
                        <Badge variant="outline" className={legalStatusMap[location.legalStatus].bg}>
                          {legalStatusMap[location.legalStatus].label}
                        </Badge>
                      )}
                    </div>

                    {location.riskLevel && (
                      <div className="flex items-center justify-between gap-1.5 mb-3">
                        <div className={`flex items-center gap-1.5 text-xs font-bold ${riskLevelMap[location.riskLevel].color}`}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {riskLevelMap[location.riskLevel].label}
                        </div>
                        <Link href="/manifesto#regulations" className="text-[10px] text-blue-500 underline flex items-center gap-0.5 hover:text-blue-700">
                          <Info className="w-2.5 h-2.5" />
                          Правила
                        </Link>
                      </div>
                    )}

                    {location.averageRating && (
                      <div className="flex items-center gap-1 mt-2 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-gray-700 text-sm">{location.averageRating.toFixed(1)}</span>
                        <span className="text-gray-400 text-xs">({location.reviewsCount})</span>
                      </div>
                    )}
                    
                    {location.amenities && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {location.amenities.water && <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-blue-100 text-blue-600">💧 Вода</Badge>}
                        {location.amenities.shade && <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-green-100 text-green-600">🌳 Сянка</Badge>}
                        {location.amenities.cellSignal && <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-purple-100 text-purple-600">📶 4G</Badge>}
                      </div>
                    )}

                    <Link href={`/spots/${location.id}`}>
                      <Button size="sm" className="w-full mt-4 bg-green-600 hover:bg-green-700 rounded-xl h-9 text-xs font-bold shadow-md shadow-green-100">
                        Отвори детайли
                      </Button>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {selectedPosition && DEFAULT_ICON && (
            <Marker 
              key="selected-position"
              position={[selectedPosition.lat, selectedPosition.lng]}
              icon={DEFAULT_ICON}
            >
              <Popup>
                <div className="p-2 text-center">
                  <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold mb-2 text-gray-900">Ново място</p>
                  <p className="text-xs text-gray-500 mb-4 tracking-tighter">
                    {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                  </p>
                  <Link href={`/add?lat=${selectedPosition.lat}&lng=${selectedPosition.lng}`}>
                    <Button 
                      size="sm" 
                      className="w-full bg-green-600 hover:bg-green-700 rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Добави точка тук
                    </Button>
                  </Link>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <div className="bg-white border-t px-4 py-3 text-center text-sm font-medium text-gray-500">
        Открий <span className="text-green-600 font-bold">{filteredLocations.length}</span> локации в България
      </div>
    </div>
  );
}
