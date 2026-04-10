import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Sparkles, Mountain, Waves, Bike, Camera, Compass, Heart } from 'lucide-react';
import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';

const ACTIVITY_TYPES = [
  { icon: Mountain, color: 'text-green-600', bg: 'bg-green-50', title: 'Езда и конни разходки', desc: 'Открий природата на конски гръб с професионални водачи' },
  { icon: Waves, color: 'text-blue-600', bg: 'bg-blue-50', title: 'Водни спортове', desc: 'Моторница, джет-ски, SUP и други водни активности' },
  { icon: Bike, color: 'text-orange-600', bg: 'bg-orange-50', title: 'ATV и офроуд', desc: 'Адреналинови преживявания с професионален водач' },
  { icon: Camera, color: 'text-purple-600', bg: 'bg-purple-50', title: 'Фото турове', desc: 'Открий най-красивите гледки с професионален фотограф' },
  { icon: Compass, color: 'text-red-600', bg: 'bg-red-50', title: 'Планински преходи', desc: 'Водени турове до скрити места и върхове' },
  { emoji: '🍷', color: 'text-rose-600', bg: 'bg-rose-50', title: 'Местни преживявания', desc: 'Дегустации, занаяти и срещи с местни хора' },
];

export default async function ExperiencesPage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/map">
            <Button variant="ghost" size="sm" className="rounded-xl font-bold text-gray-600 hover:bg-green-50 hover:text-green-700 transition-all">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад към картата
            </Button>
          </Link>
          <h1 className="text-xl font-black text-green-700 tracking-tighter">🏕️ АЙЛЯК</h1>
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none mb-2">
            ПЕРСОНАЛИЗИРАНИ <br/>
            <span className="text-green-600">ПРЕЖИВЯВАНИЯ</span>
          </h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
            Открий уникални приключения и скрити кътчета в България, подбрани от нашата общност.
          </p>
        </div>

        <Tabs defaultValue="browse" className="space-y-12">
          <div className="flex justify-center">
            <TabsList className="bg-gray-100/50 p-1 rounded-2xl border border-gray-100 h-14 w-full max-w-md shadow-inner">
              <TabsTrigger value="ai" className="flex-1 rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
                <Sparkles className="w-3.5 h-3.5 mr-2 text-green-600" />
                AI Препоръки
              </TabsTrigger>
              <TabsTrigger value="browse" className="flex-1 rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
                Категории
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ai">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-500 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <Card className="relative bg-emerald-900 border-none rounded-[3rem] overflow-hidden text-white">
                <CardContent className="p-12 md:p-20 text-center space-y-8">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/20">
                     <Sparkles className="w-12 h-12 text-green-400" />
                  </div>
                  <h3 className="text-4xl font-black tracking-tight leading-tight">
                    Твоят AI Пътеводител <br/> е почти готов.
                  </h3>
                  <p className="text-xl text-green-50/70 font-medium max-w-xl mx-auto">
                    Генерираме персонализирани маршрути и преживявания базирани на твоите предпочитания и Vanlife стил.
                  </p>
                  <Button className="bg-white text-green-900 hover:bg-green-50 rounded-2xl h-16 px-10 font-black text-lg transition-transform hover:scale-105 active:scale-95 shadow-2xl">
                    Очаквай скоро 🚀
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="browse">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ACTIVITY_TYPES.map((act, idx) => (
                <Card key={idx} className="group hover:shadow-2xl hover:shadow-gray-200 transition-all border-none bg-white rounded-[2.5rem] p-4">
                  <CardContent className="p-6 space-y-6">
                    <div className={`w-14 h-14 ${act.bg} rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      {act.icon ? (
                        <act.icon className={`w-7 h-7 ${act.color}`} />
                      ) : (
                        <span className="text-3xl">{act.emoji}</span>
                      )}
                    </div>
                    <div className="space-y-2">
                       <h3 className="font-black text-xl text-gray-900 tracking-tight">{act.title}</h3>
                       <p className="text-gray-500 font-medium text-sm leading-relaxed">{act.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[3rem] p-12 border-2 border-white shadow-xl shadow-amber-100/50">
               <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="shrink-0 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-amber-100">
                     <Compass className="w-10 h-10 text-amber-600 animate-spin-slow" />
                  </div>
                  <div className="text-center md:text-left space-y-2">
                     <h3 className="text-2xl font-black text-gray-900">Приключение по поръчка?</h3>
                     <p className="text-gray-600 font-medium">
                       Ако предлагаш уникални Outdoor преживявания и искаш да си част от Айляк, свържи се с нас.
                     </p>
                     <Button variant="link" className="text-amber-700 font-black p-0 h-auto hover:text-amber-800 underline decoration-2 underline-offset-4">
                       Стани хост на преживявания
                     </Button>
                  </div>
               </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
