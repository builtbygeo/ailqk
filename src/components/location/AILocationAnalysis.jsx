import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, CheckCircle, Copy, Lightbulb, Tag, AlignLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function AILocationAnalysis({ location, reviews }) {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const runAnalysis = async () => {
    setIsLoading(true);
    setAnalysis(null);

    const amenitiesText = location.amenities
      ? Object.entries(location.amenities)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(', ')
      : 'няма посочени удобства';

    const reviewsText = reviews.length > 0
      ? reviews.map(r => `Оценка: ${r.rating}/5. Коментар: "${r.comment || 'без коментар'}"`).join(' | ')
      : 'Все още няма отзиви.';

    const prompt = `Ти си AI асистент за оптимизиране на туристически места в България, специализиран за пътувания с кемпери, бусове и каравани.

Анализирай следното място и предложи конкретни подобрения:

**Място:** ${location.name}
**Тип:** ${location.type === 'wild' ? 'Дивo място' : 'Домакинско място'}
**Регион:** ${location.region || 'не е посочен'}
**Текущо описание:** ${location.description || 'Няма описание'}
**Текущи удобства:** ${amenitiesText}
**Брой снимки:** ${location.images?.length || 0}
**Отзиви:** ${reviewsText}

Задачи:
1. Напиши оптимизирано описание (200-300 думи) на БЪЛГАРСКИ, което привлича пътешественици с кемпери/бусове. Включи атмосферата, достъпността, и уникалното на мястото.
2. Предложи конкретни удобства (от списъка: вода, електричество, тоалетна, WiFi, близост до магазин/аптека/болница/бензиностанция) базирани на типа място и отзивите.
3. Генерирай 8-12 ключови думи/тагове на БЪЛГАРСКИ, подходящи за търсене.

Отговори на БЪЛГАРСКИ.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          optimized_description: {
            type: 'string',
            description: 'Оптимизираното описание на място'
          },
          description_improvements: {
            type: 'array',
            items: { type: 'string' },
            description: 'Списък с конкретни подобрения направени в описанието'
          },
          amenity_suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                amenity: { type: 'string' },
                reason: { type: 'string' },
                priority: { type: 'string', enum: ['висок', 'среден', 'нисък'] }
              }
            }
          },
          tags: {
            type: 'array',
            items: { type: 'string' }
          },
          overall_score: {
            type: 'number',
            description: 'Оценка на текущото качество на профила от 1 до 10'
          },
          score_reason: { type: 'string' }
        }
      }
    });

    setAnalysis(result);
    setIsLoading(false);
  };

  const saveDescription = async () => {
    setIsSaving(true);
    await base44.entities.Location.update(location.id, {
      description: analysis.optimized_description
    });
    queryClient.invalidateQueries(['location', location.id]);
    toast.success('Описанието е обновено!');
    setIsSaving(false);
  };

  const saveTags = async () => {
    setIsSaving(true);
    await base44.entities.Location.update(location.id, {
      tags: analysis.tags
    });
    queryClient.invalidateQueries(['location', location.id]);
    toast.success('Таговете са запазени!');
    setIsSaving(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Копирано!');
  };

  const priorityColor = {
    'висок': 'bg-red-100 text-red-800',
    'среден': 'bg-yellow-100 text-yellow-800',
    'нисък': 'bg-green-100 text-green-800'
  };

  const scoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="border-t pt-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Анализ на мястото
        </h2>
        <Button
          onClick={runAnalysis}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isLoading ? (
            <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Анализирам...</>
          ) : analysis ? (
            <><RefreshCw className="w-4 h-4 mr-2" />Анализирай отново</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" />Стартирай AI анализ</>
          )}
        </Button>
      </div>

      {isLoading && (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl bg-gray-100 animate-pulse h-40" />
          ))}
        </div>
      )}

      {!isLoading && analysis && (
        <div className="space-y-4">
          {/* Score */}
          {analysis.overall_score !== undefined && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <div className={`text-4xl font-bold ${scoreColor(analysis.overall_score)}`}>
                  {analysis.overall_score}/10
                </div>
                <div className="text-xs text-gray-500 mt-1">Текущ резултат</div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{analysis.score_reason}</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Optimized Description */}
            <Card className="border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-purple-600" />
                  Оптимизирано описание
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.description_improvements?.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {analysis.description_improvements.map((imp, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                        {imp}
                      </div>
                    ))}
                  </div>
                )}
                <div className="bg-purple-50 rounded-lg p-3 text-sm text-gray-800 max-h-48 overflow-y-auto leading-relaxed">
                  {analysis.optimized_description}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveDescription} disabled={isSaving} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Приложи
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(analysis.optimized_description)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Amenity Suggestions */}
            <Card className="border-amber-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  Предложения за удобства
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.amenity_suggestions?.length > 0 ? (
                  <div className="space-y-2">
                    {analysis.amenity_suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                        <Badge className={`text-xs shrink-0 ${priorityColor[s.priority] || 'bg-gray-100 text-gray-700'}`}>
                          {s.priority}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">{s.amenity}</p>
                          <p className="text-xs text-gray-500">{s.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Удобствата изглеждат добре попълнени!</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tags */}
          {analysis.tags?.length > 0 && (
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="w-4 h-4 text-green-600" />
                  Генерирани тагове
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {analysis.tags.map((tag, i) => (
                    <Badge key={i} className="bg-green-100 text-green-800 text-sm px-3 py-1">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                <Button size="sm" onClick={saveTags} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-3 h-3 mr-2" />
                  Запази таговете
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}