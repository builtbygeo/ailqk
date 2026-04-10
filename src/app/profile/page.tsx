import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { spots, reviews } from '@/db/schema';
import { eq, count, avg, and } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, User, MapPin,
  Crown, Star, MessageSquare,
  LayoutGrid, LogOut, Tent, Building2
} from 'lucide-react';
import Link from 'next/link';
import { SignOutButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import Image from 'next/image';

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Профил | Ailyak',
  description: 'Твоите места и активност в Ailyak',
};

export default async function ProfilePage() {
  let user;
  try {
    user = await currentUser();
  } catch {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-xl font-bold text-red-600">Грешка при автентикация</h2>
        <Link href="/map"><Button>Назад към картата</Button></Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl shadow-gray-200/50 space-y-8">
          <div className="w-20 h-20 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto">
            <User className="w-10 h-10 text-green-600" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Добре дошъл, пътешественико! 🚐</h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              Влез в профила си или се регистрирай, за да следиш своите приключения и да добавяш нови места.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <SignInButton mode="modal">
              <Button className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black text-white font-black text-lg transition-transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-gray-200">
                Влез в профила
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="ghost" className="w-full h-14 rounded-2xl text-green-700 hover:bg-green-50 font-bold">
                Създай нов акаунт
              </Button>
            </SignUpButton>
          </div>
          <Link href="/map">
            <Button variant="outline" size="sm" className="rounded-xl border-gray-100 text-gray-400 font-bold hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад към картата
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPro = (user.publicMetadata as { isPro?: boolean })?.isPro ?? false;

  // Real stats — all in parallel
  const [spotsCountResult, reviewsCountResult, avgRatingResult, userSpots] = await Promise.all([
    db.select({ count: count() }).from(spots).where(eq(spots.createdBy, user.id)).get(),
    db.select({ count: count() }).from(reviews).where(eq(reviews.userId, user.id)).get(),
    db.select({ avg: avg(spots.averageRating) }).from(spots)
      .where(and(eq(spots.createdBy, user.id), eq(spots.status, 'approved'))).get(),
    db.select().from(spots).where(eq(spots.createdBy, user.id)).orderBy(spots.createdAt).limit(20),
  ]);

  const spotsCount = spotsCountResult?.count ?? 0;
  const reviewsCount = reviewsCountResult?.count ?? 0;
  const avgRating = avgRatingResult?.avg ? Number(avgRatingResult.avg).toFixed(1) : '—';

  const statusLabels: Record<string, { label: string; color: string }> = {
    approved: { label: 'Одобрено', color: 'bg-green-100 text-green-700' },
    pending: { label: 'Чака одобрение', color: 'bg-amber-100 text-amber-700' },
    rejected: { label: 'Отхвърлено', color: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 selection:bg-green-100 font-sans pt-32">
      <main className="max-w-4xl mx-auto px-6 space-y-10">

        {/* Profile Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-500 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition-opacity" />
          <Card className="relative bg-white border-none rounded-[3rem] shadow-2xl shadow-gray-200/50 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-green-500 to-emerald-600 p-1 shadow-2xl shadow-green-100 shrink-0">
                  <div className="w-full h-full bg-white rounded-[2.2rem] flex items-center justify-center overflow-hidden">
                    {user.imageUrl ? (
                      <Image src={user.imageUrl} alt={user.fullName || ''} width={128} height={128} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-green-600" />
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                      <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">
                        {user.fullName || user.username || 'Приключенец'}
                      </h1>
                      {isPro ? (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-black text-[10px] tracking-widest uppercase px-3 py-1">
                          <Crown className="w-3 h-3 mr-1" />
                          PRO
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-black text-[10px] tracking-widest uppercase px-3 py-1">
                          Explorer
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-500 font-medium text-lg mt-2">{user.primaryEmailAddress?.emailAddress}</p>
                  </div>

                  <Link href="/add">
                    <Button className="rounded-2xl bg-green-600 hover:bg-green-700 font-bold h-12 px-6 shadow-xl shadow-green-100 text-white">
                      <MapPin className="w-4 h-4 mr-2" />
                      Добави ново място
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: MapPin, label: 'Места споделени', value: spotsCount, color: 'text-green-600', bg: 'bg-green-50' },
            { icon: MessageSquare, label: 'Отзиви написани', value: reviewsCount, color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Star, label: 'Среден рейтинг', value: avgRating, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden group hover:scale-[1.02] transition-transform">
              <CardContent className="p-6 text-center">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:rotate-6 transition-transform`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-black text-gray-900 leading-none">{stat.value}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User's Spots */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
              <div className="bg-gray-50/50 px-8 py-6 border-b flex items-center justify-between">
                <h3 className="font-black text-gray-900 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-gray-400" />
                  Моите Места
                </h3>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{spotsCount} места</span>
              </div>
              <CardContent className="p-6">
                {userSpots.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto grayscale opacity-50">
                      <MapPin className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-400 font-bold">Още не си споделил любими места на картата.</p>
                    <Link href="/add">
                      <Button variant="outline" className="rounded-xl border-2 font-bold hover:bg-green-50 hover:text-green-700">
                        Сподели първо място
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userSpots.map((spot) => {
                      const statusInfo = statusLabels[spot.status ?? 'pending'];
                      return (
                        <Link key={spot.id} href={`/spots/${spot.id}`} className="block group">
                          <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all">
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${spot.type === 'wild' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                              {spot.type === 'wild'
                                ? <Tent className="w-5 h-5 text-emerald-600" />
                                : <Building2 className="w-5 h-5 text-blue-600" />
                              }
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-gray-900 truncate group-hover:text-green-700 transition-colors">{spot.name}</p>
                              <p className="text-xs text-gray-400 font-medium">{spot.region}</p>
                            </div>
                            {/* Status */}
                            <Badge className={`${statusInfo.color} border-none font-bold text-[10px] uppercase tracking-wider shrink-0`}>
                              {statusInfo.label}
                            </Badge>
                            {/* Rating */}
                            {spot.averageRating && spot.averageRating > 0 ? (
                              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg shrink-0">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="font-bold text-yellow-700 text-xs">{spot.averageRating.toFixed(1)}</span>
                              </div>
                            ) : null}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pro Card / Sidebar */}
          <div className="space-y-6">
            {isPro ? (
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-gradient-to-br from-amber-500 to-orange-500 overflow-hidden text-white">
                <CardContent className="p-8 space-y-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">Ailyak Pro</h3>
                    <p className="text-white/80 text-sm font-medium mt-1">Активен абонамент</p>
                  </div>
                  <p className="text-white/70 text-sm">Можеш да добавяш домакински места и да подкрепяш общността!</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b">
                  <h3 className="font-black text-gray-900 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    Ailyak Pro
                  </h3>
                </div>
                <CardContent className="p-8 space-y-4">
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    Стани Pro и листвай собственото си домакинско място, достъпвай разширени статистики и подкрепяй Vanlife в България.
                  </p>
                  <Link href="/subscription" className="block">
                    <Button className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 font-black text-white shadow-lg shadow-amber-100">
                      Виж ползите
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Quick Add */}
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
              <CardContent className="p-8 space-y-4">
                <p className="text-sm font-bold text-gray-900">Бързи действия</p>
                <div className="space-y-2">
                  <Link href="/add" className="block">
                    <Button variant="outline" className="w-full rounded-xl font-bold border-2 hover:bg-green-50 hover:text-green-700 hover:border-green-100 justify-start">
                      <MapPin className="w-4 h-4 mr-2" />
                      Добави дива точка
                    </Button>
                  </Link>
                  {isPro && (
                    <Link href="/add?type=host" className="block">
                      <Button variant="outline" className="w-full rounded-xl font-bold border-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-100 justify-start">
                        <Building2 className="w-4 h-4 mr-2" />
                        Добави домакинско място
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
