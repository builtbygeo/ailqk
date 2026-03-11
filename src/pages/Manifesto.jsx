import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, Leaf, Users, Shield, Star, Mountain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Manifesto() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to={createPageUrl('Map')}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-green-800 mb-4">🏕️ Манифесто</h1>
          <p className="text-xl text-gray-600">Нашите ценности и мисия</p>
        </div>

        <div className="space-y-8">
          <Card className="border-l-4 border-green-600">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Heart className="w-8 h-8 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">Споделяне с любов</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Вярваме в силата на споделянето. Всяко място, което споделяш, помага на други пътешественици 
                    да открият красотата на България. Споделяй с искрено сърце и уважение към природата.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-blue-600">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Leaf className="w-8 h-8 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">Уважение към природата</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Всяко посещение трябва да остави природата непокътната. Извозвай отпадъците си, 
                    не повреждай растителността и зачитай дивата природа. "Не оставяй следи" е нашият принцип.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-600">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Users className="w-8 h-8 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">Общност и взаимопомощ</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Айляк е общност от единомишленици. Помагай на другите пътешественици с информация, 
                    съвети и топло отношение. Заедно създаваме по-добро изживяване за всички.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-600">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-orange-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">Сигурност и отговорност</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Споделяй точна и актуална информация. Ако мястото има специфични условия или рискове, 
                    информирай другите. Бъди отговорен спрямо местните жители и собственици.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-yellow-600">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Star className="w-8 h-8 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">Качество пред количество</h2>
                  <p className="text-gray-700 leading-relaxed">
                    По-добре едно отлично описано място, отколкото много непълни локации. 
                    Добавяй снимки, подробности за достъпа и честни отзиви, за да помогнеш на общността.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Mountain className="w-8 h-8 text-green-700 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">Открий истинска България</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Излез извън туристическите маршрути. Открий скрити места, запознай се с местните, 
                    опитай традиционна кухня. Истинската красота е в автентичността.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center bg-green-100 p-8 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Присъедини се към общността</h3>
          <p className="text-gray-700 mb-6">
            Споделяйки места и преживявания, ти помагаш на хиляди пътешественици да открият България по нов начин.
          </p>
          <Link to={createPageUrl('Map')}>
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Започни приключението
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}