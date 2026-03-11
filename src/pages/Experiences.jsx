import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Sparkles, Mountain, Waves, Bike, Camera, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AIRecommendations from '../components/experiences/AIRecommendations';

const ACTIVITY_TYPES = [
  { icon: Mountain, color: 'text-green-600', bg: 'bg-green-50', title: 'Езда и конни разходки', desc: 'Открий природата на конски гръб с професионални водачи' },
  { icon: Waves, color: 'text-blue-600', bg: 'bg-blue-50', title: 'Водни спортове', desc: 'Моторница, джет-ски, SUP и други водни активности' },
  { icon: Bike, color: 'text-orange-600', bg: 'bg-orange-50', title: 'ATV и офроуд', desc: 'Адреналинови преживявания с професионален водач' },
  { icon: Camera, color: 'text-purple-600', bg: 'bg-purple-50', title: 'Фото турове', desc: 'Открий най-красивите гледки с професионален фотограф' },
  { icon: Compass, color: 'text-red-600', bg: 'bg-red-50', title: 'Планински преходи', desc: 'Водени турове до скрити места и върхове' },
  { emoji: '🍷', color: 'text-rose-600', bg: 'bg-rose-50', title: 'Местни преживявания', desc: 'Дегустации, занаяти и срещи с местни хора' },
];

export default function Experiences() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b mb-6">
        <div className="max-w-5xl mx-auto px-4 py-4">
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
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">🎯 Преживявания</h1>
          <p className="text-xl text-gray-600">Открий уникални приключения в България</p>
        </div>

        <Tabs defaultValue={user ? 'ai' : 'browse'}>
          <TabsList className="w-full mb-8 h-12 rounded-xl">
            {user && (
              <TabsTrigger value="ai" className="flex-1 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Препоръки
              </TabsTrigger>
            )}
            <TabsTrigger value="browse" className="flex-1 text-sm font-medium">
              🗺️ Категории
            </TabsTrigger>
          </TabsList>

          {/* AI Tab */}
          {user && (
            <TabsContent value="ai">
              <AIRecommendations user={user} />
            </TabsContent>
          )}

          {/* Browse Tab */}
          <TabsContent value="browse">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {ACTIVITY_TYPES.map((act, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow rounded-2xl overflow-hidden border-0 shadow">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${act.bg} rounded-xl flex items-center justify-center mb-4`}>
                      {act.icon ? (
                        <act.icon className={`w-6 h-6 ${act.color}`} />
                      ) : (
                        <span className="text-2xl">{act.emoji}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{act.title}</h3>
                    <p className="text-gray-500 text-sm">{act.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!user && (
              <Card className="bg-gradient-to-r from-green-600 to-emerald-700 border-0 rounded-2xl text-white text-center">
                <CardContent className="py-10 px-6">
                  <div className="text-4xl mb-4">✨</div>
                  <h3 className="text-2xl font-bold mb-3">Влез, за да получиш AI препоръки</h3>
                  <p className="text-green-100 mb-6">
                    Нашият AI ще анализира твоя профил и история, за да ти предложи персонализирани приключения
                  </p>
                  <Button
                    className="bg-white text-green-700 hover:bg-green-50 font-bold px-8 py-6 rounded-xl text-lg"
                    onClick={() => base44.auth.redirectToLogin(window.location.href)}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Влез и получи препоръки
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="mt-6 bg-amber-50 border-amber-200 rounded-2xl">
              <CardContent className="pt-6 text-center">
                <h3 className="text-xl font-bold mb-3">Очаквайте скоро!</h3>
                <p className="text-gray-700 mb-2">
                  Работим усилено, за да ти предоставим най-добрите преживявания в България.
                  Скоро ще можеш да резервираш директно през платформата.
                </p>
                <p className="text-sm text-gray-500">
                  Интересуваш се да предлагаш преживявания? Свържи се с нас!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}