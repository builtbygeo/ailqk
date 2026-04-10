"use client";

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { bulgariaGeoJSON } from '@/data/bulgaria';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Search, Filter, Star, 
  AlertTriangle, Shield, Clock, Plus,
  Tent, Building2, SlidersHorizontal,
  ChevronRight, Camera
} from 'lucide-react';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import MapClickHandler from './MapClickHandler';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

// Safe Icon Definitions (Hard-Icon Strategy)
let DEFAULT_ICON: any = null;
let TRAIL_ICON: any = null;
let PENDING_ICON: any = null;

if (typeof window !== 'undefined') {
  const createCustomIcon = (color: string, iconType: 'pin' | 'trail' | 'clock' = 'pin') => {
    let iconSvg = `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`;
    if (iconType === 'clock') iconSvg = `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`;
    
    return new L.DivIcon({
      className: 'custom-div-icon',
      html: `<div style="
        background-color: ${color};
        width: 38px;
        height: 38px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        color: white;
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg>
      </div>`,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38]
    });
  };

  DEFAULT_ICON = createCustomIcon('#059669'); // Emerald-600
  TRAIL_ICON = createCustomIcon('#3b82f6', 'trail');   // Blue-500
  PENDING_ICON = createCustomIcon('#f59e0b', 'clock'); // Amber-500
}

const bulgariaStyle = { fillColor: 'transparent', color: '#059669', weight: 3, opacity: 0.6 };

interface Spot {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: 'wild' | 'host';
  region: string;
  status: 'pending' | 'approved' | 'rejected' | null;
  imageUrl?: string | null;
  averageRating?: number | null;
  reviewsCount?: number | null;
  legalStatus?: 'tolerated' | 'approved' | 'protected' | 'strict' | null;
  riskLevel?: 'low' | 'medium' | 'high' | 'extreme' | null;
  amenities?: any | null;
  createdBy?: string | null;
}

const legalStatusMap = {
  tolerated: { label: "Толерирано", bg: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  approved: { label: "Одобрено за 2026", bg: "bg-blue-50 text-blue-700 border-blue-100" },
  protected: { label: "Защитена зона", bg: "bg-orange-50 text-orange-700 border-orange-100" },
  strict: { label: "Стриктна забрана", bg: "bg-red-50 text-red-700 border-red-100" }
};

export default function MapContent({ initialLocations }: { initialLocations: Spot[] }) {
  const [filterType, setFilterType] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterLegal, setFilterLegal] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number, lng: number } | null>(null);
  const { user } = useUser();

  const filteredLocations = initialLocations.filter(loc => {
    const matchesType = filterType === 'all' || loc.type === filterType;
    const matchesRisk = filterRisk === 'all' || loc.riskLevel === filterRisk;
    const matchesLegal = filterLegal === 'all' || loc.legalStatus === filterLegal;
    const matchesSearch = !searchTerm || 
      loc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.region?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesRisk && matchesLegal && matchesSearch;
  });

  const FilterSelectors = ({ isMobile = false }) => (
    <div className={cn("flex gap-4", isMobile ? "flex-col" : "flex-row items-end")}>
      <div className="space-y-2 flex-1">
        {!isMobile && <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Тип място</label>}
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className={cn("rounded-2xl border-none bg-gray-100/60 font-black text-sm transition-all hover:bg-gray-200/50", isMobile ? "h-16 px-6" : "h-12 min-w-[180px]")}>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600 shrink-0" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-none shadow-2xl bg-white/95 backdrop-blur-xl z-[10005]">
            <SelectItem value="all" className="rounded-xl focus:bg-emerald-50 focus:text-emerald-700">Всички типове</SelectItem>
            <SelectItem value="wild" className="rounded-xl focus:bg-emerald-50 focus:text-emerald-700">🏞️ Диви места</SelectItem>
            <SelectItem value="host" className="rounded-xl focus:bg-emerald-50 focus:text-emerald-700">🏡 Домакини</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 flex-1">
        {!isMobile && <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ниво на риск</label>}
        <Select value={filterRisk} onValueChange={setFilterRisk}>
          <SelectTrigger className={cn("rounded-2xl border-none bg-gray-100/60 font-black text-sm transition-all hover:bg-gray-200/50", isMobile ? "h-16 px-6" : "h-12 min-w-[180px]")}>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-500 shrink-0" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-none shadow-2xl bg-white/95 backdrop-blur-xl z-[10005]">
            <SelectItem value="all" className="rounded-xl focus:bg-orange-50 focus:text-orange-700">Всички нива риск</SelectItem>
            <SelectItem value="low" className="rounded-xl focus:bg-orange-50 focus:text-orange-700">✅ Нисък риск</SelectItem>
            <SelectItem value="medium" className="rounded-xl focus:bg-orange-50 focus:text-orange-700">⚠️ Среден риск</SelectItem>
            <SelectItem value="high" className="rounded-xl focus:bg-orange-50 focus:text-orange-700">❌ Висок риск</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 flex-1">
        {!isMobile && <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Правен Статут</label>}
        <Select value={filterLegal} onValueChange={setFilterLegal}>
          <SelectTrigger className={cn("rounded-2xl border-none bg-gray-100/60 font-black text-sm transition-all hover:bg-gray-200/50", isMobile ? "h-16 px-6" : "h-12 min-w-[180px]")}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-500 shrink-0" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-none shadow-2xl bg-white/95 backdrop-blur-xl z-[10005]">
            <SelectItem value="all" className="rounded-xl focus:bg-blue-50 focus:text-blue-700">Всички статути</SelectItem>
            <SelectItem value="tolerated" className="rounded-xl focus:bg-blue-50 focus:text-blue-700">🌿 Толерирано</SelectItem>
            <SelectItem value="approved" className="rounded-xl focus:bg-blue-50 focus:text-blue-700">✅ Одобрено</SelectItem>
            <SelectItem value="protected" className="rounded-xl focus:bg-blue-50 focus:text-blue-700">🦅 Защитено</SelectItem>
            <SelectItem value="strict" className="rounded-xl focus:bg-blue-50 focus:text-blue-700">⛔ Забранено</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full relative z-0 group/map overflow-hidden animate-pro">
      
      {/* Search & Filters Overlay */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-6xl px-4 pointer-events-none">
        <div className="glass-pro rounded-[2rem] p-2.5 flex items-center gap-3 pointer-events-auto transition-all hover:bg-white/90">
          {/* Main Search Input */}
          <div className="relative flex-1 group/search">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within/search:text-emerald-600 transition-all duration-300" />
            <Input 
              placeholder="Търси приключение, регион..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 h-16 border-none bg-transparent shadow-none focus-visible:ring-0 text-xl font-black text-gray-900 placeholder:text-gray-400 placeholder:font-bold"
            />
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:flex items-end gap-4 pr-3 border-l border-gray-100/50 pl-6 h-12">
            <FilterSelectors />
          </div>

          {/* Mobile Filter Trigger */}
          <div className="lg:hidden pr-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all shadow-sm ring-1 ring-emerald-100/50">
                  <SlidersHorizontal className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-[3rem] p-8 border-none bg-white/95 backdrop-blur-2xl h-[75vh] shadow-[0_-20px_60px_rgba(0,0,0,0.15)]">
                <SheetHeader className="mb-10 text-left">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
                  <SheetTitle className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-2">Филтрирай</SheetTitle>
                  <p className="text-gray-500 font-bold">Намери перфектното място за къмпинг</p>
                </SheetHeader>
                <div className="space-y-10">
                  <FilterSelectors isMobile />
                  <div className="pt-6">
                    <Button 
                      className="w-full h-16 rounded-[2rem] bg-gray-900 hover:bg-black text-white font-black text-xl shadow-2xl active:scale-95 transition-all"
                      onClick={() => {}}
                    >
                      Покажи резултатите ({filteredLocations.length})
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <MapContainer
        center={[42.7339, 25.4858]}
        zoom={8}
        minZoom={6}
        maxBounds={[[38.0, 18.0], [48.0, 32.0]]}
        maxBoundsViscosity={0.7}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        
        <GeoJSON data={bulgariaGeoJSON} style={bulgariaStyle} interactive={false} />

        <MapClickHandler onMapClick={setSelectedPosition} />

        {filteredLocations.map((location) => {
          if (!location.latitude || !location.longitude || !DEFAULT_ICON) return null;
          
          const isPending = location.status === 'pending';
          const isTrail = location.name?.toLowerCase().includes('екопътека');
          
          let icon = isTrail ? TRAIL_ICON : DEFAULT_ICON;
          if (isPending) icon = PENDING_ICON;

          return (
            <Marker key={location.id} position={[location.latitude, location.longitude]} icon={icon}>
              <Popup className="custom-popup">
                <div className="p-0 min-w-[300px] overflow-hidden group/popup">
                  <div className="relative h-40 bg-gray-100 overflow-hidden">
                    {location.imageUrl ? (
                      <img src={location.imageUrl} alt={location.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover/popup:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600">
                        <Camera className="w-12 h-12 text-white/30" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                       {isPending && (
                        <Badge className="bg-amber-500 text-white border-none rounded-xl font-black text-[10px] uppercase shadow-2xl px-3 py-1">
                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-[10px] uppercase rounded-xl border-gray-100 bg-gray-50 font-black tracking-tight px-3 py-1">
                        {location.type === 'wild' ? '🏞️ WILD' : '🏡 HOST'}
                      </Badge>
                      {location.legalStatus && (
                        <Badge variant="outline" className={`text-[10px] uppercase rounded-xl ${legalStatusMap[location.legalStatus].bg} border-none font-black tracking-tight px-3 py-1`}>
                          {legalStatusMap[location.legalStatus].label}
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-black text-2xl mb-4 text-gray-900 leading-tight tracking-tight group-hover/popup:text-emerald-700 transition-colors">
                      {location.name}
                    </h3>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-gray-500 font-black text-xs uppercase tracking-widest">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        {location.region}
                      </div>
                      {location.averageRating && (
                         <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-black text-amber-700 text-sm">{location.averageRating}</span>
                        </div>
                      )}
                    </div>

                    <Link href={`/spots/${location.id}`} className="block">
                      <Button className="w-full bg-gray-900 hover:bg-black text-white rounded-[1.5rem] h-14 text-sm font-black shadow-2xl transition-all hover:translate-y-[-4px] hover:shadow-emerald-900/10">
                        Виж детайли
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {selectedPosition && DEFAULT_ICON && (
          <Marker position={[selectedPosition.lat, selectedPosition.lng]} icon={DEFAULT_ICON}>
            <Popup className="custom-popup">
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                  <Plus className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="font-black text-2xl text-gray-900 leading-none mb-3 tracking-tight">Ново място?</h4>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-loose">
                    {selectedPosition.lat.toFixed(6)}<br />{selectedPosition.lng.toFixed(6)}
                  </p>
                </div>
                <Link href={`/add?lat=${selectedPosition.lat}&lng=${selectedPosition.lng}`}>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-[1.5rem] h-14 font-black text-white shadow-2xl shadow-emerald-100 transition-all hover:scale-105 active:scale-95">
                    Добави тук
                  </Button>
                </Link>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Interactive Legends */}
      <div className="absolute bottom-10 right-10 z-[500] hidden md:block">
        <div className="glass-pro px-6 py-4 rounded-[2.5rem] flex items-center gap-6 animate-pro ring-1 ring-black/5">
          <div className="flex items-center gap-3 group/legend">
            <span className="w-3.5 h-3.5 rounded-xl bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover/legend:scale-125 transition-transform"></span>
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Одобрени</span>
          </div>
          <div className="w-px h-6 bg-gray-200/60"></div>
          <div className="flex items-center gap-3 group/legend">
            <span className="w-3.5 h-3.5 rounded-xl bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)] group-hover/legend:scale-125 transition-transform"></span>
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">В процес</span>
          </div>
        </div>
      </div>
    </div>
  );
}
