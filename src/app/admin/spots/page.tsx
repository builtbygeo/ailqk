import { db } from '@/db';
import { spots } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, CheckCircle2, XCircle, Clock, ArrowLeft, Shield, Tent, Building2 } from 'lucide-react';
import Link from 'next/link';
import { approveSpot, rejectSpot } from '@/app/actions';

export const metadata = {
  title: 'Admin — Управление на места | Ailyak',
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

  const riskColors: Record<string, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-orange-100 text-orange-700',
    extreme: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 selection:bg-green-100 font-sans pt-32">
      <div className="max-w-6xl mx-auto px-6 space-y-10">


        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Чакат одобрение', value: pending.length, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
            { label: 'Одобрени', value: approved.length, color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
            { label: 'Отхвърлени', value: rejected.length, color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
          ].map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm rounded-2xl bg-white">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Spots — action required */}
        <section>
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Чакат одобрение
            {pending.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black">
                {pending.length}
              </span>
            )}
          </h2>

          {pending.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500 font-bold">Всички места са обработени!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((spot) => (
                <Card key={spot.id} className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Type icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${spot.type === 'wild' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                        {spot.type === 'wild'
                          ? <Tent className="w-6 h-6 text-emerald-600" />
                          : <Building2 className="w-6 h-6 text-blue-600" />
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <h3 className="font-black text-gray-900 text-lg leading-tight">{spot.name}</h3>
                            <p className="text-sm text-gray-500 font-medium">{spot.region} · {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}</p>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Badge className={`${riskColors[spot.riskLevel ?? 'low']} border-none text-[10px] uppercase tracking-wider font-bold`}>
                              {spot.riskLevel}
                            </Badge>
                            <Badge className="bg-gray-100 text-gray-600 border-none text-[10px] uppercase tracking-wider font-bold">
                              {spot.type === 'wild' ? '🏞️ Диво' : '🏡 Домакинско'}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-2">{spot.description}</p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 font-medium">
                          <span>ID: <code className="bg-gray-100 px-1 rounded">{spot.id}</code></span>
                          {spot.createdBy && <span>Потребител: <code className="bg-gray-100 px-1 rounded">{spot.createdBy.slice(0, 12)}…</code></span>}
                          {spot.imageUrl && (
                            <a href={spot.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              Снимка ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-5 pt-5 border-t border-gray-100 flex-wrap">
                      <Link href={`/spots/${spot.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="rounded-xl font-bold border-2 text-xs">
                          <MapPin className="w-3.5 h-3.5 mr-1.5" />
                          Преглед
                        </Button>
                      </Link>
                      <form action={async () => { await approveSpot(spot.id); }}>
                        <Button type="submit" size="sm" className="rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white text-xs shadow-md shadow-green-100">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          Одобри
                        </Button>
                      </form>
                      <form action={async () => { await rejectSpot(spot.id); }}>
                        <Button type="submit" size="sm" variant="outline" className="rounded-xl font-bold border-2 border-red-200 text-red-600 hover:bg-red-50 text-xs">
                          <XCircle className="w-3.5 h-3.5 mr-1.5" />
                          Отхвърли
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Recently Approved */}
        {approved.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Одобрени места ({approved.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {approved.slice(0, 10).map((spot) => (
                <Link key={spot.id} href={`/spots/${spot.id}`} target="_blank">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${spot.type === 'wild' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                      {spot.type === 'wild'
                        ? <Tent className="w-4 h-4 text-emerald-600" />
                        : <Building2 className="w-4 h-4 text-blue-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate text-sm">{spot.name}</p>
                      <p className="text-xs text-gray-400">{spot.region}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-none text-[10px] shrink-0">Одобрено</Badge>
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
