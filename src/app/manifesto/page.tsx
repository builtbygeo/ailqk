import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, Heart, Leaf, Users, Shield, 
  Star, Mountain, Scale, AlertTriangle, 
  CheckCircle2, Info, Compass 
} from 'lucide-react';

export default function ManifestoPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-green-100 selection:text-green-900">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <Link href="/map">
          <Button variant="ghost" className="mb-8 rounded-xl hover:bg-green-50 text-green-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Към картата
          </Button>
        </Link>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-bold mb-6 tracking-wider uppercase">
            Мисия и Ценности
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-none">
            АЙЛЯК <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
              МАНИФЕСТО
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Ние вярваме, че приключението и отговорността вървят ръка за ръка. Тук са принципите, които ни водят.
          </p>
        </div>

        <div className="grid gap-6 mb-20">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-green-50/50 rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <Heart className="w-10 h-10 text-green-600 mb-6" />
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Споделяне с любов</h2>
                <p className="text-gray-600 leading-relaxed font-medium">
                  Вярваме в силата на общността. Всяко място, което споделяш, помага на други да открият красотата на България.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-blue-50/50 rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <Leaf className="w-10 h-10 text-blue-600 mb-6" />
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Leave No Trace</h2>
                <p className="text-gray-600 leading-relaxed font-medium">
                  Твоят отпечатък трябва да бъде само в сърцето ти. Извозвай боклука си, не пали огън извън регламентираните места.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card id="regulations" className="border-none shadow-sm bg-gray-50/50 rounded-3xl overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <Scale className="w-12 h-12 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-black mb-6 text-gray-900 tracking-tight">
                    Българско законодателство 2026
                  </h2>
                  <div className="prose prose-green max-w-none text-gray-600 font-medium space-y-4">
                    <p>
                      Дивото къмпингуване и нощуването в бус (vanlife) са регулирани дейности. Противно на митовете, 
                      не всичко е забранено, но правила съществуват и ние държим на тях.
                    </p>
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                      <h4 className="flex items-center gap-2 text-gray-900 font-bold mb-3">
                        <Shield className="w-4 h-4 text-green-600" />
                        Основни закони
                      </h4>
                      <ul className="text-sm space-y-2 list-none pl-0">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span><b>Закон за туризма:</b> Дефинира регламентираните къмпинги.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span><b>Закон за защитените територии:</b> Забранява бивакуването и огъня в национални паркове (Рила, Пирин, Центр. Балкан).</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span><b>Наредба 2025:</b> Регулира зони А и Б по Черноморието (допускат се само кметски одобрени места).</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-4 font-bold text-gray-900">Регион</th>
                      <th className="py-4 font-bold text-gray-900">Правен Статус</th>
                      <th className="py-4 font-bold text-gray-900">Толерантност</th>
                      <th className="py-4 font-bold text-gray-900">Риск / Бележки</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-gray-600">
                    <tr className="border-b border-gray-50 hover:bg-white transition-colors">
                      <td className="py-4 font-bold text-gray-800">Планини (Родопи, Странджа)</td>
                      <td className="py-4">Забранено в НП</td>
                      <td className="py-4 text-green-600">Висока</td>
                      <td className="py-4 text-xs font-semibold">Най-добрите спотове. Избягвай ядрата на НП.</td>
                    </tr>
                    <tr className="border-b border-gray-50 hover:bg-white transition-colors">
                      <td className="py-4 font-bold text-gray-800">Черноморие (Зони А/Б)</td>
                      <td className="py-4">Стриктно (2025)</td>
                      <td className="py-4 text-orange-600">Ниска (лято)</td>
                      <td className="py-4 text-xs font-semibold">Само одобрени места. Глобите са реални.</td>
                    </tr>
                    <tr className="border-b border-gray-50 hover:bg-white transition-colors">
                      <td className="py-4 font-bold text-gray-800">Земеделски земи / Гори</td>
                      <td className="py-4">Забранено (огън)</td>
                      <td className="py-4 text-emerald-600">Много висока</td>
                      <td className="py-4 text-xs font-semibold">Ок, ако си дискретен и без огън.</td>
                    </tr>
                    <tr className="border-b border-gray-50 hover:bg-white transition-colors">
                      <td className="py-4 font-bold text-gray-800">Национални Резервати</td>
                      <td className="py-4 font-bold text-red-600 uppercase tracking-tighter">Строго забранено</td>
                      <td className="py-4 text-red-700">Нулева</td>
                      <td className="py-4 text-xs font-bold text-red-600">Глоби от 300 до 1,200 лв.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-emerald-900 rounded-[3rem] p-10 md:p-16 text-white text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Compass className="w-64 h-64 -mr-20 -mt-20" />
          </div>
          <h3 className="text-4xl font-black mb-8 relative z-10 leading-tight">
            Бъди промяната, <br />която искаш да видиш в природата
          </h3>
          <div className="grid sm:grid-cols-2 gap-6 text-left mb-10 relative z-10">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-emerald-800 rounded-lg"><Info className="w-5 h-5" /></div>
              <p className="text-sm font-medium opacity-90 leading-relaxed">
                <b>Пристигай късно, тръгвай рано.</b> Колкото по-малко е видимо присъствието ти, толкова по-добре.
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-emerald-800 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
              <p className="text-sm font-medium opacity-90 leading-relaxed">
                <b>Без огън.</b> Използвай газов котлон. Горските пожари са най-голямата заплаха.
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-emerald-800 rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
              <p className="text-sm font-medium opacity-90 leading-relaxed">
                <b>Уважение към местните.</b> Винаги питай за разрешение, ако си близо до къщи или ферми.
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-emerald-800 rounded-lg"><Users className="w-5 h-5" /></div>
              <p className="text-sm font-medium opacity-90 leading-relaxed">
                <b>Подкрепяй икономиката.</b> Хапни в местната кръчма, купи мляко от бабата в селото.
              </p>
            </div>
          </div>
          <Link href="/map">
            <Button size="lg" className="bg-white text-emerald-900 hover:bg-white/90 rounded-2xl px-12 h-16 text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/20">
              Разбрах, да започваме
            </Button>
          </Link>
        </div>

        <footer className="mt-20 text-center text-gray-400 text-sm font-medium">
          <p>© 2026 Ailyak Outdoor Bulgaria. <br /> Информацията е валидна към Март 2026.</p>
        </footer>
      </div>
    </div>
  );
}
