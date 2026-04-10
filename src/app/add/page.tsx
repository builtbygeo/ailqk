"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, MapPin, Check, 
  AlertTriangle, Shield, 
  HelpCircle, Crown, Lock
} from 'lucide-react';
import { addSpot } from '@/app/actions';
import { Suspense } from 'react';

type AmenityKey = 'water' | 'shade' | 'flatGround' | 'cellSignal' | 'firePit' | 'petFriendly' | 'toilet' | 'electricity' | 'wifi';

function AddSpotForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [proRequired, setProRequired] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'wild',
    latitude: searchParams.get('lat') || '',
    longitude: searchParams.get('lng') || '',
    region: '',
    imageUrl: '',
    legalStatus: 'tolerated',
    riskLevel: 'low',
    confirmNotProtected: false,
    amenities: {
      water: false,
      shade: false,
      flatGround: false,
      cellSignal: false,
      firePit: false,
      petFriendly: false,
      toilet: false,
      electricity: false,
      wifi: false
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.confirmNotProtected) {
      alert("Моля, потвърдете, че мястото не е в защитена територия.");
      return;
    }

    setLoading(true);
    const result = await addSpot(formData);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push('/map'), 2000);
    } else if ((result as { requiresPro?: boolean }).requiresPro) {
      setProRequired(true);
    } else {
      alert(result.error);
    }
  };

  if (success) {
    return (
      <div className="h-screen flex items-center justify-center bg-white p-6">
        <Card className="max-w-md w-full border-none shadow-2xl rounded-[2.5rem] p-8 text-center bg-green-50">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200 animate-bounce">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Готово!</h2>
          <p className="text-gray-600 font-medium leading-relaxed">
            Мястото е добавено и очаква одобрение. Благодарим ти, че правиш Vanlife в България по-добър!
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 selection:bg-green-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/map">
          <Button variant="ghost" className="mb-8 rounded-xl hover:bg-white text-gray-600 font-bold group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Назад към картата
          </Button>
        </Link>

        <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
          <div className="h-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
          <CardHeader className="p-8 md:p-12 pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest mb-4">
              Step 1: Детайли за мястото
            </div>
            <CardTitle className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-2">
              Добави ново <span className="text-green-600">Outdoor</span> преживяване
            </CardTitle>
            <CardDescription className="text-gray-500 font-medium text-lg">
              Сподели любимо място, като се съобразиш с правилата за 2026 г.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 md:p-12 pt-0">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Basic Info */}
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700 ml-1">Име на мястото *</Label>
                  <Input 
                    required 
                    placeholder="напр. Панорамна поляна край яз. Беглика"
                    className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-lg font-medium px-6"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700 ml-1">Тип място</Label>
                    <Select value={formData.type} onValueChange={(val) => { setFormData({...formData, type: val}); setProRequired(false); }}>
                      <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-2xl border-gray-100">
                        <SelectItem value="wild">🏞️ Дивo място (свободен достъп)</SelectItem>
                        <SelectItem value="host">🏡 Домакинско място (с такса) 👑 Pro</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.type === 'host' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                        <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                        <p className="text-xs font-bold text-amber-800">
                          Домакинските места са само за <Link href="/subscription" className="underline text-amber-700">Ailyak Pro</Link> потребители.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700 ml-1">Регион</Label>
                    <Input 
                      required 
                      placeholder="напр. Родопи, Стара Планина"
                      className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-medium px-6"
                      value={formData.region}
                      onChange={(e) => setFormData({...formData, region: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700 ml-1">URL на снимка</Label>
                  <Input 
                    placeholder="Линк към снимка в Google Maps или социални мрежи"
                    className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all font-medium px-6"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700 ml-1">Описание & Достъп</Label>
                  <Textarea 
                    placeholder="Опиши пътя до там, подходящо ли е за кемпери, има ли специфични правила..."
                    className="rounded-2xl border-gray-100 bg-gray-50/50 min-h-[120px] p-6 font-medium text-gray-600 focus:bg-white transition-all"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold">
                  <MapPin className="w-5 h-5 text-red-500" />
                  Локация (GPS)
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Input 
                      required 
                      type="number" 
                      step="0.000001" 
                      placeholder="Latitude"
                      className="h-12 rounded-xl border-gray-200 font-mono bg-white"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input 
                      required 
                      type="number" 
                      step="0.000001" 
                      placeholder="Longitude"
                      className="h-12 rounded-xl border-gray-200 font-mono bg-white"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* 2026 Regulations SECION */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest">
                  Step 2: Отговорно къмпингуване (2026)
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                      Правен статут
                      <HelpCircle className="w-3.5 h-3.5 text-blue-500 cursor-help" />
                    </Label>
                    <Select value={formData.legalStatus} onValueChange={(val) => setFormData({...formData, legalStatus: val})}>
                      <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-white font-medium shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-2xl border-gray-100">
                        <SelectItem value="tolerated">🌿 Толерирано (Разрешено за престой)</SelectItem>
                        <SelectItem value="approved">✅ Одобрено (Официална зона за бивакуване)</SelectItem>
                        <SelectItem value="protected">🦅 Защитена зона (Само дневно - БЕЗ нощувки)</SelectItem>
                        <SelectItem value="strict">⛔ Стриктна забрана (Риск от конфискация)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                      Ниво на риск (Глоби)
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                    </Label>
                    <Select value={formData.riskLevel} onValueChange={(val) => setFormData({...formData, riskLevel: val})}>
                      <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-white font-medium shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-2xl border-gray-100">
                        <SelectItem value="low">🛡️ Нисък риск (Спокойно)</SelectItem>
                        <SelectItem value="medium">🟡 Среден риск (Възможни проверки)</SelectItem>
                        <SelectItem value="high">🟠 Висок риск (Глоби ~300 лв)</SelectItem>
                        <SelectItem value="extreme">🔴 Критичен (Глоби до 1200 лв)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Risk Guidance Box */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-6 space-y-4 shadow-sm">
                  <h4 className="text-sm font-black text-blue-900 flex items-center gap-2 uppercase tracking-tight">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Наръчник за риск (2026 Regulations)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-blue-800">
                    <div className="flex gap-3 bg-white/60 p-3 rounded-xl border border-blue-100">
                      <span className="shrink-0 text-green-600 text-lg">●</span>
                      <span><strong>Нисък:</strong> Безопасно. Публични земи, извън паркове. Не се очакват глоби.</span>
                    </div>
                    <div className="flex gap-3 bg-white/60 p-3 rounded-xl border border-blue-100">
                      <span className="shrink-0 text-yellow-500 text-lg">●</span>
                      <span><strong>Среден:</strong> Брегове, язовири. Възможни проверки за огън и боклук.</span>
                    </div>
                    <div className="flex gap-3 bg-white/60 p-3 rounded-xl border border-blue-100">
                      <span className="shrink-0 text-orange-500 text-lg">●</span>
                      <span><strong>Висок:</strong> Натура 2000. Редовни патрули. Глоби средно около ~300 лв.</span>
                    </div>
                    <div className="flex gap-3 bg-white/60 p-3 rounded-xl border border-blue-100">
                      <span className="shrink-0 text-red-600 text-lg">●</span>
                      <span><strong>Критичен:</strong> Национални паркове. Забранени зони. Глоби до 1,200 лв.</span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border-4 border-red-200 rounded-[2.5rem] p-8 flex items-start gap-6 shadow-lg shadow-red-100/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="relative">
                    <Checkbox 
                      id="confirmProtected"
                      checked={formData.confirmNotProtected}
                      onCheckedChange={(checked) => setFormData({...formData, confirmNotProtected: !!checked})}
                      className="peer border-red-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 w-8 h-8 rounded-xl transition-all duration-300 hover:scale-110 active:scale-90"
                    />
                    {!formData.confirmNotProtected && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmProtected" className="text-xl font-black text-red-900 leading-tight cursor-pointer block hover:text-red-800 transition-colors">
                      Потвърждавам, че мястото НЕ е в строго защитена територия или Национален парк.
                    </Label>
                    <p className="text-sm text-red-700 font-bold uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      ⚠️ Глобите за къмпиране в паркове достигат до 1,200 лв.
                    </p>
                  </div>
                </div>

              </div>

              {/* Amenities */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest">
                  Step 3: Удобства
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-gray-50/50 p-8 rounded-[2rem]">
                  {([
                    { id: 'water', label: '💧 Вода', key: 'water' as AmenityKey },
                    { id: 'shade', label: '🌳 Сянка', key: 'shade' as AmenityKey },
                    { id: 'flat', label: '🗺️ Равен терен', key: 'flatGround' as AmenityKey },
                    { id: 'signal', label: '📶 Обхват', key: 'cellSignal' as AmenityKey },
                    { id: 'fire', label: '🔥 Огнище', key: 'firePit' as AmenityKey },
                    { id: 'pet', label: '🐾 Pet Friendly', key: 'petFriendly' as AmenityKey },
                    { id: 'toilet', label: '🚽 Тоалетна', key: 'toilet' as AmenityKey },
                    { id: 'elect', label: '⚡ Ток', key: 'electricity' as AmenityKey },
                    { id: 'wifi', label: '🌐 WiFi', key: 'wifi' as AmenityKey },
                  ] as const).map((amenity) => (
                    <div key={amenity.id} className="flex items-center gap-3">
                      <Checkbox 
                        id={amenity.id} 
                        checked={formData.amenities[amenity.key]}
                        onCheckedChange={(checked) => setFormData({
                          ...formData, 
                          amenities: {...formData.amenities, [amenity.key]: !!checked}
                        })}
                        className="rounded-md border-gray-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <Label htmlFor={amenity.id} className="text-sm font-bold text-gray-700 leading-none cursor-pointer">
                        {amenity.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 space-y-4">
                {proRequired && (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-black text-amber-900">Нужен е Ailyak Pro абонамент</p>
                      <p className="text-sm text-amber-700 font-medium mt-1">Домакинските места могат да се листват само от Pro потребители.</p>
                      <Link href="/subscription" className="block mt-3">
                        <Button size="sm" className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black">
                          <Crown className="w-4 h-4 mr-2" />
                          Виж Ailyak Pro
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
                <Button 
                  type="submit" 
                  disabled={loading || !formData.confirmNotProtected}
                  className="w-full h-20 rounded-[2rem] bg-gray-900 hover:bg-black text-xl font-black text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Запазване...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-green-400" />
                      Публикувай според правилата
                    </div>
                  )}
                </Button>
                <p className="text-center text-xs text-gray-400 font-medium">
                  С публикуването се съгласявате с <Link href="/manifesto" className="underline hover:text-green-600">Манифестото на Айляк</Link> и принципите на Leave No Trace.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AddSpotPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-600 rounded-full animate-spin" />
      </div>
    }>
      <AddSpotForm />
    </Suspense>
  );
}
