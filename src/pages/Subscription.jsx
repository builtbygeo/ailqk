import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Crown, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Subscription() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => navigate(createPageUrl('Map')));
  }, []);

  if (!user) return null;

  const isPro = user.subscription_tier === 'pro';

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="bg-white shadow-sm border-b mb-6">
        <div className="max-w-6xl mx-auto px-4 py-4">
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
      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-green-700">Айляк</span> <span className="text-amber-600">Pro</span>
          </h1>
          <p className="text-xl text-gray-600">Открий повече възможности за твоите приключения</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Zap className="w-6 h-6 text-gray-600" />
                Безплатен
              </CardTitle>
              <p className="text-3xl font-bold mt-4">0 лв</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Преглед на всички одобрени места</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Добавяне на диви места (свободен достъп)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Писане на отзиви и рейтинги</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Запазване на любими места</span>
                </div>
              </div>
              {!isPro && (
                <Badge className="bg-green-100 text-green-800 w-full justify-center py-2">
                  Текущ план
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-2 border-amber-500 shadow-lg">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-amber-500 text-white px-4 py-1">
                <Crown className="w-4 h-4 mr-1" />
                Препоръчан
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Crown className="w-6 h-6 text-amber-600" />
                Айляк Pro
              </CardTitle>
              <p className="text-3xl font-bold mt-4">
                10 € <span className="text-lg font-normal text-gray-600">/ месец</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-amber-600 mt-0.5" />
                  <span className="font-medium">Всичко от безплатния план</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-amber-600 mt-0.5" />
                  <span className="font-semibold">Добавяне на частни/домакински места</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-amber-600 mt-0.5" />
                  <span>Приоритетна видимост на твоите места</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-amber-600 mt-0.5" />
                  <span>Управление на резервации</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-amber-600 mt-0.5" />
                  <span>Детайлна статистика за места</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-amber-600 mt-0.5" />
                  <span>Приоритетна поддръжка</span>
                </div>
              </div>
              <Button 
                className="w-full bg-amber-600 hover:bg-amber-700 text-lg py-6"
                disabled={isPro}
              >
                {isPro ? 'Активен Pro план' : 'Надстрой до Pro'}
              </Button>
              {isPro && (
                <p className="text-center text-sm text-gray-600">
                  Благодарим ти за подкрепата! 🎉
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-gray-600 text-sm">
          <p>Всички цени са в евро. Абонаментът може да бъде прекратен по всяко време.</p>
        </div>
      </div>
    </div>
  );
}