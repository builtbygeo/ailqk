import { db } from "@/db";
import { spots, amenities, reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Star, Share2, Navigation, AlertTriangle, Shield, Info, InfoIcon } from "lucide-react";
import Link from 'next/link';
import ReviewsList from "@/components/location/ReviewsList";
import ReviewFormWrapper from "@/components/location/ReviewFormWrapper";

export default async function SpotDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: spotId } = await params;
  
  const spot = await db.select().from(spots).where(eq(spots.id, spotId)).get();
  
  if (!spot) {
    notFound();
  }

  const spotAmenities = await db.select().from(amenities).where(eq(amenities.spotId, spotId)).get();
  const spotReviews = await db.select().from(reviews).where(eq(reviews.spotId, spotId)).all();

  const legalStatusMap = {
    tolerated: { label: "Толерирано", bg: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    approved: { label: "Одобрено за 2026", bg: "bg-blue-50 text-blue-700 border-blue-100" },
    protected: { label: "Защитена зона", bg: "bg-orange-50 text-orange-700 border-orange-100" },
    strict: { label: "Стриктен контрол", bg: "bg-red-50 text-red-700 border-red-100" }
  };

  const riskLevelMap = {
    low: { label: "Нисък риск", color: "text-emerald-700", bg: "bg-emerald-50" },
    medium: { label: "Среден риск", color: "text-amber-700", bg: "bg-amber-50" },
    high: { label: "Висок риск", color: "text-orange-700", bg: "bg-orange-50" },
    extreme: { label: "Критичен риск", color: "text-red-700", bg: "bg-red-50" }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 selection:bg-green-100">
      {/* Hero / Back */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/map">
            <Button variant="ghost" size="sm" className="rounded-xl font-bold text-gray-600 hover:bg-green-50 hover:text-green-700 transition-all">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад към картата
            </Button>
          </Link>
          <h1 className="text-xl font-black text-green-700 tracking-tighter">🏕️ АЙЛЯК</h1>
          <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 text-gray-500">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 mt-8">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Context */}
          <div className="lg:col-span-2 space-y-10">
            {/* Gallery (Placeholder or Single Image) */}
            <div className="aspect-video w-full bg-gray-200 rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-gray-200">
              {spot.imageUrl ? (
                <img src={spot.imageUrl} alt={spot.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <MapPin className="w-12 h-12 mb-2 opacity-20" />
                  <span className="font-black tracking-widest text-xs uppercase opacity-30">No Image Available</span>
                </div>
              )}
              <div className="absolute top-6 left-6 flex gap-2">
                <Badge variant="outline" className={`${spot.type === 'wild' ? 'bg-emerald-500/90' : 'bg-blue-500/90'} text-white border-none backdrop-blur-md px-3 py-1 font-black text-[10px] uppercase tracking-widest`}>
                  {spot.type === 'wild' ? '🏞️ Дивo Място' : '🏡 Домакинско'}
                </Badge>
              </div>
            </div>

            {/* Header Info */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                 {spot.legalStatus && (
                   <Badge variant="outline" className={`${legalStatusMap[spot.legalStatus as keyof typeof legalStatusMap].bg} border font-bold rounded-lg`}>
                     {legalStatusMap[spot.legalStatus as keyof typeof legalStatusMap].label}
                   </Badge>
                 )}
                 <div className="flex items-center gap-1.5 text-sm text-gray-500 ml-auto">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-bold underline cursor-pointer">{spot.region}</span>
                 </div>
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">
                {spot.name}
              </h1>
              
              <div className="flex items-center gap-6 pt-2 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-yellow-50 rounded-2xl flex items-center justify-center shadow-inner">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-gray-900 leading-none">{spot.averageRating?.toFixed(1)}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{spot.reviewsCount} отзива</p>
                  </div>
                </div>
                {spot.riskLevel && (
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 ${riskLevelMap[spot.riskLevel as keyof typeof riskLevelMap].bg} rounded-2xl flex items-center justify-center shadow-inner`}>
                      <AlertTriangle className={`w-5 h-5 ${riskLevelMap[spot.riskLevel as keyof typeof riskLevelMap].color}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-black ${riskLevelMap[spot.riskLevel as keyof typeof riskLevelMap].color} leading-none truncate max-w-[120px]`}>
                        {riskLevelMap[spot.riskLevel as keyof typeof riskLevelMap].label}
                      </p>
                      <Link href="/manifesto#regulations" className="text-[10px] text-gray-400 font-bold uppercase tracking-widest underline decoration-gray-200 decoration-2 hover:text-blue-500 transition-colors">Правила</Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <InfoIcon className="w-5 h-5 text-gray-400" />
                За мястото
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed font-medium">
                {spot.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-6">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Какво предлага това място
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {spotAmenities && Object.entries(spotAmenities).map(([key, val]) => {
                  if (typeof val !== 'boolean' || !val) return null;
                  const labels: Record<string, string> = {
                    water: '💧 Питейна вода',
                    shade: '🌳 Сянка',
                    flatGround: '🗺️ Равен терен',
                    cellSignal: '📶 Обхват (4G)',
                    firePit: '🔥 Огнище',
                    petFriendly: '🐾 Pet Friendly',
                    toilet: '🚽 Тоалетна',
                    electricity: '⚡ Ток',
                    wifi: '🌐 WiFi'
                  };
                  if (!labels[key]) return null;
                  return (
                    <div key={key} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <span className="font-bold text-gray-800 text-sm">{labels[key]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-8 pt-6">
              <div className="flex items-center justify-between border-b pb-6">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Отзиви</h2>
                <ReviewFormWrapper locationId={spotId} />
              </div>
              <ReviewsList reviews={spotReviews as any} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Navigation Card */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl shadow-gray-200/50 space-y-6">
                <div className="text-center space-y-2">
                   <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Навигация</p>
                   <h3 className="text-2xl font-black text-gray-900">Как да стигна?</h3>
                </div>
                
                <div className="space-y-3">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`}
                    target="_blank"
                    className="flex items-center gap-4 bg-gray-900 hover:bg-black text-white p-4 rounded-2xl transition-all shadow-xl shadow-gray-200/50 hover:scale-[1.02]"
                  >
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-black text-sm">Google Maps</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Open Navigator</p>
                    </div>
                  </a>
                </div>

                <div className="pt-4 text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Координати</p>
                  <p className="font-mono text-xs text-gray-500 mt-1">{spot.latitude.toFixed(6)}, {spot.longitude.toFixed(6)}</p>
                </div>
              </div>

              {/* Manifesto Reminder */}
              <div className="bg-green-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-green-200/50 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Leaf className="w-32 h-32" />
                </div>
                <h3 className="text-xl font-black mb-4 relative z-10 leading-tight">Leave No Trace 🌿</h3>
                <p className="text-green-50/80 text-sm font-bold mb-6 relative z-10 leading-relaxed">
                  Помогни ни да запазим тези места диви. Винаги събирай боклука си и се съобразявай с местните правила.
                </p>
                <Link href="/manifesto">
                  <Button className="w-full bg-white text-green-700 hover:bg-green-50 font-black rounded-xl">
                    Виж Манифесто
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Simple Leaf component for the manifesto card
function Leaf({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L21,22V2C21,2 17,2.2 17,8Z" />
    </svg>
  );
}
