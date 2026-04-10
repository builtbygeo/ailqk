import { db } from '@/db';
import { spots } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm'; // Added 'and' for future filtering
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MapPin, CheckCircle2, XCircle, Clock, 
  ArrowLeft, Shield, Tent, Building2,
  Search, Filter, LayoutDashboard, Settings
} from 'lucide-react';
import Link from 'next/link';
import { approveSpot, rejectSpot } from '@/app/actions';
import { Input } from '@/components/ui/input';

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Admin Mastery — Ailyak',
  description: 'Управление на места и сигурност в Ailyak',
};

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').filter(Boolean);

export default async function AdminSpotsPage() {
  const user = await currentUser();
  if (!user || !ADMIN_USER_IDS.includes(user.id)) {
    redirect('/map');
  }

  const allSpots = await db
    .select()
    .from(spots)
    .orderBy(desc(spots.createdAt));

  const pending = allSpots.filter((s) => s.status === 'pending');
  const approved = allSpots.filter((s) => s.status === 'approved');
  const rejected = allSpots.filter((s) => s.status === 'rejected');

  const wildCount = allSpots.filter(s => s.type === 'wild').length;
  const hostCount = allSpots.filter(s => s.type === 'host').length;

  const riskColors: Record<string, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-orange-100 text-orange-700',
    extreme: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 selection:bg-green-100 font-sans pt-32">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        
        {/* Pro Max Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3 justify-center md:justify-start">
              <Shield className="w-10 h-10 text-green-600" />
              ADMIN <span className="text-green-600">MASTERY</span>
            </h1>
            <p className="text-gray-500 font-medium">Контрол на качеството и безопасността на местата</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                <Input 
                  placeholder="Търси по име или регион..." 
                  className="pl-11 h-12 w-full md:w-64 rounded-2xl border-none shadow-sm transition-all focus-visible:ring-green-600/20 focus-visible:ring-offset-0"
                />
             </div>
             <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-sm hover:bg-green-50">
               <Filter className="w-4 h-4 text-gray-600" />
             </Button>
          </div>
        </div>

        {/* Dynamic Matrix View */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending', value: pending.length, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
            { label: 'Wild Spots', value: wildCount, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Tent },
            { label: 'Host Spots', value: hostCount, color: 'text-blue-600', bg: 'bg-blue-50', icon: Building2 },
            { label: 'Risk Map', value: 'Live', color: 'text-red-600', bg: 'bg-red-50', icon: Shield },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden group hover:scale-[1.02] transition-transform">
              <CardContent className="p-6">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl mb-4 flex items-center justify-center group-hover:rotate-6 transition-transform`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-black text-gray-900 leading-none">{stat.value}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Priority Queue */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <div className="w-2 h-8 bg-amber-500 rounded-full" />
              PRIORITY QUEUE
              {pending.length > 0 && (
                <Badge className="bg-amber-100 text-amber-700 border-none font-black text-xs px-3 py-1">
                  {pending.length} REQUIRED
                </Badge>
              )}
            </h2>
          </div>

          {pending.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 py-24 text-center space-y-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-black text-gray-900">Системата е чиста!</p>
                <p className="text-gray-400 font-medium">Няма нови места чакащи одобрение.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {pending.map((spot) => (
                <Card key={spot.id} className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] bg-white overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Visual Context */}
                      <div className="lg:w-72 h-48 lg:h-auto bg-gray-100 relative overflow-hidden shrink-0">
                        {spot.imageUrl ? (
                           <img src={spot.imageUrl} alt={spot.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                             <MapPin className="w-12 h-12" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                           <Badge className={`${spot.type === 'wild' ? 'bg-emerald-500' : 'bg-blue-600'} text-white border-none font-black text-[10px] uppercase tracking-widest`}>
                              {spot.type === 'wild' ? 'WILD' : 'HOST'}
                           </Badge>
                        </div>
                      </div>

                      {/* Content Matrix */}
                      <div className="p-8 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">{spot.name}</h3>
                              <p className="text-sm text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {spot.region}
                              </p>
                            </div>
                            <Badge className={`${riskColors[spot.riskLevel ?? 'low']} border-none font-black text-[10px] uppercase tracking-widest px-3 py-1.5`}>
                              {spot.riskLevel} RISK
                            </Badge>
                          </div>
                          <p className="text-gray-500 font-medium leading-relaxed line-clamp-2">{spot.description}</p>
                        </div>

                        <div className="flex items-center justify-between gap-6 pt-6 mt-6 border-t border-gray-50 flex-wrap">
                          <div className="flex items-center gap-6">
                             <div className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                               ID: <span className="text-gray-400">{spot.id.slice(0, 8)}</span>
                             </div>
                             {spot.createdBy && (
                               <div className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                                 USER: <span className="text-gray-400">{spot.createdBy.slice(0, 8)}</span>
                               </div>
                             )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Link href={`/spots/${spot.id}`}>
                              <Button variant="ghost" className="rounded-2xl font-bold h-12 hover:bg-gray-100 px-6">
                                View Spot
                              </Button>
                            </Link>
                            <form action={async () => { "use server"; await approveSpot(spot.id); }}>
                              <Button type="submit" className="rounded-2xl h-12 bg-green-600 hover:bg-green-700 text-white font-black px-8 shadow-xl shadow-green-100 transition-transform active:scale-95">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                APPROVE
                              </Button>
                            </form>
                            <form action={async () => { "use server"; await rejectSpot(spot.id); }}>
                              <Button type="submit" variant="outline" className="rounded-2xl h-12 border-2 border-red-100 text-red-600 hover:bg-red-50 font-black px-8">
                                <XCircle className="w-4 h-4 mr-2" />
                                REJECT
                              </Button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Archive / History */}
        {approved.length > 0 && (
          <section className="space-y-6 opacity-60 hover:opacity-100 transition-opacity duration-500">
            <h2 className="text-xl font-black text-gray-400 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              RECENTLY VALIDATED
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approved.slice(0, 6).map((spot) => (
                <Link key={spot.id} href={`/spots/${spot.id}`}>
                  <div className="p-5 bg-white border border-gray-100 rounded-3xl flex items-center gap-4 hover:border-green-200 hover:bg-green-50/20 transition-all">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${spot.type === 'wild' ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                      {spot.type === 'wild' ? <Tent className="w-6 h-6 text-emerald-600" /> : <Building2 className="w-6 h-6 text-blue-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-gray-900 truncate">{spot.name}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{spot.region}</p>
                    </div>
                    <div className="ml-auto">
                       <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
