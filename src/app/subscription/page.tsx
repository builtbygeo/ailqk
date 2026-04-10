import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Crown, Zap, Leaf, Sparkles, Heart } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 selection:bg-amber-100 font-sans pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/map">
            <Button variant="ghost" size="sm" className="rounded-xl font-bold text-gray-600 hover:bg-amber-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
          <h1 className="text-xl font-black text-amber-600 tracking-tighter">👑 АЙЛЯК PRO</h1>
          <div className="w-10 h-10" />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-black uppercase tracking-widest">
            Level Up Your Adventure
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none">
            АЙЛЯК <span className="text-amber-500">PRO</span>
          </h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
            Открий повече възможности, подкрепи общността и отключи скрити функции за твоите приключения.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Free Plan */}
          <Card className="relative bg-white border-none rounded-[3rem] shadow-xl overflow-hidden flex flex-col">
            <CardContent className="p-10 md:p-14 flex-1 space-y-10">
              <div className="space-y-2">
                <div className="w-16 h-16 bg-gray-50 rounded-[2rem] flex items-center justify-center border border-gray-100">
                  <Zap className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Безплатен</h3>
                <div className="text-4xl font-black text-gray-900">0 лв <span className="text-sm font-bold text-gray-400">завинаги</span></div>
              </div>

              <div className="space-y-4">
                {[
                  'Преглед на всички одобрени места',
                  'Добавяне на диви места (свободен достъп)',
                  'Писане на отзиви и рейтинги',
                  'Запазване на любими места'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="shrink-0 w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center mt-0.5">
                       <Check className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <span className="text-gray-600 font-bold">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Button disabled className="w-full h-16 rounded-2xl bg-gray-100 text-gray-400 font-black text-lg">
                  Текущ план
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative bg-gray-900 border-none rounded-[3rem] shadow-2xl shadow-amber-200/50 overflow-hidden flex flex-col transform lg:scale-105 z-10">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Crown className="w-48 h-48 -mr-12 -mt-12 text-amber-500" />
            </div>
            <CardContent className="p-10 md:p-14 flex-1 space-y-10 text-white relative z-10">
              <div className="space-y-2">
                <div className="w-16 h-16 bg-amber-500 rounded-[2rem] flex items-center justify-center shadow-xl shadow-amber-500/20">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black text-amber-500">Айляк Pro</h3>
                <div className="text-4xl font-black text-white">10 € <span className="text-sm font-bold text-gray-400">на месец</span></div>
              </div>

              <div className="space-y-4">
                {[
                  'Всичко от безплатния план',
                  'Добавяне на частни/домакински места',
                  'AI персонализирани маршрути (Beta)',
                  'Управление на резервации',
                  'Детайлна статистика за места',
                  'Приоритетна поддръжка'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="shrink-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center mt-0.5 shadow-lg shadow-amber-500/20">
                       <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-gray-100 font-bold">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Button className="w-full h-16 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-lg shadow-2xl shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-95">
                  Надстрой до Pro
                </Button>
                <p className="text-center text-[10px] text-gray-500 font-black uppercase tracking-widest mt-6">
                  Сигурни плащания с Stripe
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mt-32 grid md:grid-cols-3 gap-10">
           {[
             { icon: Leaf, title: 'Мисия "Зелена България"', desc: '10% от всички абонаменти отиват директно за почистване и облагородяване на диви места.' },
             { icon: Sparkles, title: 'AI Смарт Пътуване', desc: 'Нашият алгоритъм намира най-безопасните и красиви места според твоето возило.' },
             { icon: Heart, title: 'Подкрепа за Общността', desc: 'Помагаш ни да поддържаме картата безплатна и достъпна за всички Vanlife ентусиасти.' }
           ].map((benefit, i) => (
             <div key={i} className="text-center space-y-4 group">
                <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-gray-200 border border-gray-100 group-hover:scale-110 transition-transform">
                   <benefit.icon className="w-6 h-6 text-amber-600" />
                </div>
                <h4 className="text-xl font-black text-gray-900 tracking-tight">{benefit.title}</h4>
                <p className="text-gray-500 font-medium leading-relaxed">{benefit.desc}</p>
             </div>
           ))}
        </div>
      </main>
    </div>
  );
}
