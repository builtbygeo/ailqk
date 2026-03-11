import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, Star, MessageSquare, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReviewForm from '../components/location/ReviewForm';
import ReviewsList from '../components/location/ReviewsList';
import BookingRequestForm from '../components/location/BookingRequestForm';
import AILocationAnalysis from '../components/location/AILocationAnalysis';
import AmenitiesManager from '../components/location/AmenitiesManager';

export default function LocationDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const locationId = urlParams.get('id');
  const [user, setUser] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: location, isLoading } = useQuery({
    queryKey: ['location', locationId],
    queryFn: async () => {
      const locs = await base44.entities.Location.filter({ id: locationId });
      return locs[0];
    }
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', locationId],
    queryFn: () => base44.entities.Review.filter({ location_id: locationId })
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Мястото не е намерено</h2>
          <Link to={createPageUrl('Map')}>
            <Button>Назад към картата</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Map')}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад към картата
              </Button>
            </Link>
            <Link to={createPageUrl('Map')}>
              <h1 className="text-xl font-bold text-green-700">🏕️ Айляк</h1>
            </Link>
          </div>
        </div>

        {/* Снимки Gallery - Airbnb Style */}
        {location.images && location.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-6 h-[400px] md:h-[500px]">
            <div className="md:col-span-2 md:row-span-2 rounded-l-xl overflow-hidden">
              <img src={location.images[0]} alt="" className="w-full h-full object-cover hover:brightness-95 transition" />
            </div>
            {location.images.slice(1, 5).map((img, idx) => (
              <div 
                key={idx} 
                className={`overflow-hidden ${idx === 1 ? 'rounded-tr-xl' : ''} ${idx === 3 ? 'rounded-br-xl' : ''}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover hover:brightness-95 transition" />
              </div>
            ))}
          </div>
        )}

        <div className="px-6 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Title and Rating */}
              <div className="border-b pb-6 mb-6">
                <h1 className="text-3xl font-bold mb-3">{location.name}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  {location.average_rating && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-black text-black" />
                      <span className="font-semibold">{location.average_rating.toFixed(2)}</span>
                      <span className="text-gray-500">· {location.reviews_count} {location.reviews_count === 1 ? 'отзив' : 'отзива'}</span>
                    </div>
                  )}
                  <Badge className={location.type === 'wild' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                    {location.type === 'wild' ? '🏞️ Дивo място' : '🏡 Домакинско'}
                  </Badge>
                  {location.region && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="underline">{location.region}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {location.description && (
                <div className="border-b pb-6 mb-6">
                  <p className="text-gray-700 text-lg leading-relaxed">{location.description}</p>
                  {location.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {location.tags.map((tag, i) => (
                        <span key={i} className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Amenities */}
              {user && (user.email === location.created_by || user.role === 'admin') ? (
                <AmenitiesManager location={location} />
              ) : (
                location.amenities && (
                  <div className="border-b pb-6 mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Какво предлага това място</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {location.amenities.water && <div className="flex items-center gap-3"><span className="text-2xl">💧</span><span>Вода</span></div>}
                      {location.amenities.electricity && <div className="flex items-center gap-3"><span className="text-2xl">⚡</span><span>Електричество</span></div>}
                      {location.amenities.toilet && <div className="flex items-center gap-3"><span className="text-2xl">🚽</span><span>Тоалетна</span></div>}
                      {location.amenities.wifi && <div className="flex items-center gap-3"><span className="text-2xl">📶</span><span>WiFi</span></div>}
                    </div>
                    {(location.amenities.supermarket_distance || location.amenities.pharmacy_distance ||
                      location.amenities.hospital_distance || location.amenities.gas_station_distance) && (
                      <div className="mt-6">
                        <h3 className="font-semibold mb-3">Наблизо</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {location.amenities.supermarket_distance && <div className="flex items-center gap-2 text-sm"><span className="text-xl">🛒</span><span>Супермаркет: {location.amenities.supermarket_distance} км</span></div>}
                          {location.amenities.pharmacy_distance && <div className="flex items-center gap-2 text-sm"><span className="text-xl">💊</span><span>Аптека: {location.amenities.pharmacy_distance} км</span></div>}
                          {location.amenities.hospital_distance && <div className="flex items-center gap-2 text-sm"><span className="text-xl">🏥</span><span>Болница: {location.amenities.hospital_distance} км</span></div>}
                          {location.amenities.gas_station_distance && <div className="flex items-center gap-2 text-sm"><span className="text-xl">⛽</span><span>Бензиностанция: {location.amenities.gas_station_distance} км</span></div>}
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Host Info */}
              {location.type === 'hosted' && (
                <div className="border-b pb-6 mb-6">
                  <h2 className="text-2xl font-semibold mb-4">Информация от домакина</h2>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                    {location.host_phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📞</span>
                        <span className="font-medium">{location.host_phone}</span>
                      </div>
                    )}
                    {location.host_notes && (
                      <p className="text-gray-700 mt-3">{location.host_notes}</p>
                    )}
                  </div>
                </div>
              )}
              {/* Location */}
              <div className="border-b pb-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4">Локация</h2>
                {location.address && <p className="text-gray-700 mb-2">📍 {location.address}</p>}
                {location.region && <p className="text-gray-600 mb-3">🗺️ Регион: {location.region}</p>}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700">GPS координати</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-green-500 hover:bg-green-50 transition group"
                    >
                      <span className="text-xl">🗺️</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700">Google Maps</p>
                        <p className="text-xs text-gray-500">{location.latitude?.toFixed(5)}, {location.longitude?.toFixed(5)}</p>
                      </div>
                    </a>
                    <a
                      href={`https://maps.apple.com/?ll=${location.latitude},${location.longitude}&q=${encodeURIComponent(location.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-blue-500 hover:bg-blue-50 transition group"
                    >
                      <span className="text-xl">🍎</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">Apple Maps</p>
                        <p className="text-xs text-gray-500">{location.latitude?.toFixed(5)}, {location.longitude?.toFixed(5)}</p>
                      </div>
                    </a>
                    <a
                      href={`https://waze.com/ul?ll=${location.latitude},${location.longitude}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-purple-500 hover:bg-purple-50 transition group"
                    >
                      <span className="text-xl">🚗</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-700">Waze</p>
                        <p className="text-xs text-gray-500">{location.latitude?.toFixed(5)}, {location.longitude?.toFixed(5)}</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* AI Analysis - visible only to owner or admin */}
              {user && (user.email === location.created_by || user.role === 'admin') && (
                <AILocationAnalysis location={location} reviews={reviews} />
              )}

              {/* Reviews */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Star className="w-6 h-6" />
                    {location.average_rating ? `${location.average_rating.toFixed(2)} · ${reviews.length} ${reviews.length === 1 ? 'отзив' : 'отзива'}` : `${reviews.length} ${reviews.length === 1 ? 'отзив' : 'отзива'}`}
                  </h2>
                  {user && !showReviewForm && (
                    <Button onClick={() => setShowReviewForm(true)} variant="outline">
                      Напиши отзив
                    </Button>
                  )}
                </div>
                {showReviewForm && user && (
                  <div className="mb-6">
                    <ReviewForm
                      locationId={locationId}
                      onClose={() => setShowReviewForm(false)}
                    />
                  </div>
                )}
                <ReviewsList reviews={reviews} />
              </div>
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <Card className="shadow-xl border-2">
                  <CardContent className="p-6">
                    {location.type === 'hosted' ? (
                      <>
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">Място с домакин</p>
                          <p className="text-2xl font-bold">Свържи се за цена</p>
                        </div>
                        {user && (
                          <Button 
                            onClick={() => setShowBookingForm(true)} 
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 py-6 text-lg"
                          >
                            <Calendar className="w-5 h-5 mr-2" />
                            Заяви резервация
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-4xl mb-2">🏞️</div>
                        <p className="font-semibold text-lg mb-2">Дивo място</p>
                        <p className="text-sm text-gray-600">Свободен достъп без резервация</p>
                      </div>
                    )}
                    <div className="mt-6 pt-6 border-t text-center">
                      <p className="text-sm text-gray-500 mb-2">Споделено от</p>
                      <p className="font-medium">{location.creator_display_name || location.created_by?.split('@')[0] || 'Айляк общност'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && location.type === 'hosted' && user && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <BookingRequestForm
                location={location}
                user={user}
                onClose={() => setShowBookingForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}