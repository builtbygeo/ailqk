import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, MapPin, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AIRecommendations({ user }) {
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const { data: myReviews = [] } = useQuery({
    queryKey: ['myReviews', user?.email],
    queryFn: () => base44.entities.Review.filter({ created_by: user.email }),
    enabled: !!user
  });

  const { data: myBookings = [] } = useQuery({
    queryKey: ['myBookings', user?.email],
    queryFn: () => base44.entities.BookingRequest.filter({ guest_email: user.email }),
    enabled: !!user
  });

  const { data: popularLocations = [] } = useQuery({
    queryKey: ['popularLocations'],
    queryFn: () => base44.entities.Location.filter({ status: 'approved' }, '-average_rating', 10),
    enabled: !!user
  });

  const generateRecommendations = async () => {
    setIsLoading(true);
    setHasGenerated(true);

    const profileContext = `
Потребителски профил:
- Тип превозно средство: ${user?.vehicle_type || 'не е посочено'}
- Детайли за возилото: ${user?.vehicle_details || 'не е посочено'}
- Биография: ${user?.bio || 'не е посочено'}
`;

    const historyContext = myReviews.length > 0
      ? `Посетени места (от отзиви): ${myReviews.map(r => `локация ${r.location_id} (оценка: ${r.rating}/5, коментар: "${r.comment || ''}")`).join('; ')}`
      : 'Все още няма посетени места.';

    const bookingsContext = myBookings.length > 0
      ? `Резервации: ${myBookings.map(b => `${b.location_name} (${b.arrival_date} - ${b.departure_date})`).join('; ')}`
      : 'Все още няма резервации.';

    const popularContext = popularLocations.length > 0
      ? `Популярни места в платформата: ${popularLocations.map(l => `${l.name} (${l.region || ''}, рейтинг: ${l.average_rating?.toFixed(1) || 'n/a'})`).join('; ')}`
      : '';

    const prompt = `Ти си AI асистент за приключенски пътувания в България с кемпери, бусове и каравани.

${profileContext}
${historyContext}
${bookingsContext}
${popularContext}

Генерирай 4 персонализирани препоръки за преживявания в България, базирани на профила и историята на потребителя.
Всяко преживяване трябва да е конкретно и реалистично за България.
Включи региона, типа активност, защо е подходящо за този потребител и конкретни съвети.

Отговори на БЪЛГАРСКИ език.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                region: { type: 'string' },
                type: { type: 'string' },
                emoji: { type: 'string' },
                description: { type: 'string' },
                why_for_you: { type: 'string' },
                tip: { type: 'string' },
                difficulty: { type: 'string', enum: ['Лесно', 'Умерено', 'Предизвикателно'] }
              }
            }
          },
          new_experience_idea: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              emoji: { type: 'string' }
            }
          }
        }
      }
    });

    setRecommendations(result);
    setIsLoading(false);
  };

  const difficultyColor = {
    'Лесно': 'bg-green-100 text-green-800',
    'Умерено': 'bg-yellow-100 text-yellow-800',
    'Предизвикателно': 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-8 text-white text-center">
        <div className="text-5xl mb-4">✨</div>
        <h2 className="text-3xl font-bold mb-3">AI Препоръки</h2>
        <p className="text-green-100 text-lg mb-6 max-w-lg mx-auto">
          Нашият AI анализира твоя профил, история и популярните места, за да ти предложи персонализирани приключения
        </p>
        <Button
          onClick={generateRecommendations}
          disabled={isLoading}
          className="bg-white text-green-700 hover:bg-green-50 font-bold text-lg px-8 py-6 rounded-xl shadow-lg"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Генерирам...
            </>
          ) : hasGenerated ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2" />
              Генерирай нови
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Генерирай препоръки
            </>
          )}
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-48" />
          ))}
        </div>
      )}

      {/* Recommendations */}
      {!isLoading && recommendations?.recommendations && (
        <>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              Персонализирани препоръки за теб
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {recommendations.recommendations.map((rec, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow border-2 hover:border-green-300 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{rec.emoji}</div>
                      {rec.difficulty && (
                        <Badge className={difficultyColor[rec.difficulty] || 'bg-gray-100 text-gray-700'}>
                          {rec.difficulty}
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{rec.title}</h4>
                    {rec.region && (
                      <div className="flex items-center gap-1 text-green-700 text-sm font-medium mb-3">
                        <MapPin className="w-3 h-3" />
                        {rec.region}
                      </div>
                    )}
                    <p className="text-gray-600 text-sm mb-3">{rec.description}</p>
                    {rec.why_for_you && (
                      <div className="bg-green-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-green-800 mb-1">🎯 Защо е подходящо за теб</p>
                        <p className="text-xs text-green-700">{rec.why_for_you}</p>
                      </div>
                    )}
                    {rec.tip && (
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-amber-800 mb-1">💡 Съвет</p>
                        <p className="text-xs text-amber-700">{rec.tip}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* New Experience Idea */}
          {recommendations.new_experience_idea && (
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{recommendations.new_experience_idea.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Идея за ново преживяване</p>
                    <h4 className="text-lg font-bold text-gray-900">{recommendations.new_experience_idea.title}</h4>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">{recommendations.new_experience_idea.description}</p>
              </CardContent>
            </Card>
          )}

          {/* CTA to explore map */}
          <div className="text-center pt-2">
            <Link to={createPageUrl('Map')}>
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-xl text-lg">
                <MapPin className="w-5 h-5 mr-2" />
                Разгледай местата на картата
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}