import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, Plus, Search, Filter, Star, Menu, BookOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MapClickHandler from '../components/map/MapClickHandler';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapPage() {
  // Custom icon for trails (eco-paths) - moved inside component
  const trailIcon = React.useMemo(() => new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }), []);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const currentUser = await base44.auth.me().catch(() => null);
      if (currentUser?.role === 'admin') {
        return base44.entities.Location.list();
      }
      return base44.entities.Location.filter({ status: 'approved' });
    },
  });

  const filteredLocations = locations.filter(loc => {
    const matchesType = filterType === 'all' || loc.type === filterType;
    const matchesSearch = !searchTerm || 
      loc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.region?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const centerBulgaria = [42.7339, 25.4858];

  const handleMapClick = (latlng) => {
    setSelectedPosition(latlng);
  };

  const handleAddLocationHere = () => {
    navigate(createPageUrl('AddLocation') + `?lat=${selectedPosition.lat}&lng=${selectedPosition.lng}`);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b z-50 relative">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-green-700">🏕️ Айляк</h1>
            <div className="flex gap-3">
              <Link to={createPageUrl('Manifesto')}>
                <Button variant="ghost" size="sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Манифесто
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="w-4 h-4 mr-2" />
                    Меню
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Profile')} className="w-full cursor-pointer">
                      👤 Профил
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Experiences')} className="w-full cursor-pointer">
                      🎯 Преживявания
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Subscription')} className="w-full cursor-pointer">
                      👑 Айляк Pro
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link to={createPageUrl('AddLocation')}>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Добави място
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              <Input
                placeholder="🔍  Търси място, регион, град в България..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-7 text-lg rounded-2xl shadow-md border-2 border-green-200 focus:border-green-500 bg-white placeholder:text-gray-400 font-medium"
              />
            </div>
            <div className="flex gap-3 flex-wrap items-center">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[190px] h-11 rounded-xl border-green-200">
                  <Filter className="w-4 h-4 mr-2 text-green-600" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="all">Всички места</SelectItem>
                  <SelectItem value="wild">🏞️ Диви места</SelectItem>
                  <SelectItem value="hosted">🏡 Домакински места</SelectItem>
                </SelectContent>
              </Select>
              {filteredLocations.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-xl text-white">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {filteredLocations.length} {filteredLocations.length === 1 ? 'място' : 'места'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Зареждане на картата...</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={centerBulgaria}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <MapClickHandler onMapClick={handleMapClick} />
            
            {filteredLocations.map((location) => {
              const isTrail = location.name?.includes('Екопътека') || location.description?.includes('Екопътека');
              const markerProps = {
                key: location.id,
                position: [location.latitude, location.longitude]
              };
              if (isTrail) {
                markerProps.icon = trailIcon;
              }
              return (
              <Marker {...markerProps}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-1">{location.name}</h3>
                    <Badge className={location.type === 'wild' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                      {location.type === 'wild' ? '🏞️ Дивo място' : '🏡 Домакинско'}
                    </Badge>
                    {location.average_rating && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{location.average_rating.toFixed(1)}</span>
                        <span className="text-gray-500 text-sm">({location.reviews_count})</span>
                      </div>
                    )}
                    <Link to={createPageUrl('LocationDetails') + '?id=' + location.id}>
                      <Button size="sm" className="w-full mt-3 bg-green-600 hover:bg-green-700">
                        Виж детайли
                      </Button>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            )}
            )}

            {selectedPosition && (
              <Marker position={[selectedPosition.lat, selectedPosition.lng]}>
                <Popup>
                  <div className="p-2 text-center">
                    <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold mb-2">Ново място</p>
                    <p className="text-xs text-gray-600 mb-3">
                      {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                    </p>
                    <Button 
                      size="sm" 
                      onClick={handleAddLocationHere}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Добави място тук
                    </Button>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        )}
      </div>

      {/* Bottom Stats */}
      <div className="bg-white border-t p-3 text-center text-sm text-gray-600">
        Намерени места: <span className="font-bold text-green-700">{filteredLocations.length}</span>
      </div>
    </div>
  );
}