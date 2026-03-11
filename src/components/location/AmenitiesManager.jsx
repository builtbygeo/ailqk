import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Pencil, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const BOOL_AMENITIES = [
  { key: 'water', label: 'Вода', emoji: '💧' },
  { key: 'electricity', label: 'Електричество', emoji: '⚡' },
  { key: 'toilet', label: 'Тоалетна', emoji: '🚽' },
  { key: 'wifi', label: 'WiFi', emoji: '📶' },
];

const DISTANCE_AMENITIES = [
  { key: 'supermarket_distance', label: 'Супермаркет (км)', emoji: '🛒' },
  { key: 'pharmacy_distance', label: 'Аптека (км)', emoji: '💊' },
  { key: 'hospital_distance', label: 'Болница (км)', emoji: '🏥' },
  { key: 'gas_station_distance', label: 'Бензиностанция (км)', emoji: '⛽' },
];

export default function AmenitiesManager({ location }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [amenities, setAmenities] = useState(location.amenities || {});

  const toggleBool = (key) => {
    setAmenities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setDistance = (key, value) => {
    setAmenities(prev => ({ ...prev, [key]: value === '' ? null : parseFloat(value) }));
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Location.update(location.id, { amenities });
    queryClient.invalidateQueries(['location', location.id]);
    toast.success('Удобствата са обновени!');
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setAmenities(location.amenities || {});
    setEditing(false);
  };

  return (
    <div className="border-b pb-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Какво предлага това място</h2>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="w-4 h-4 mr-1" />
            Редактирай
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-1" />
              {saving ? 'Запазване...' : 'Запази'}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Boolean amenities */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {BOOL_AMENITIES.map(({ key, label, emoji }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-2xl">{emoji}</span>
            {editing ? (
              <div className="flex items-center gap-2">
                <Switch
                  id={key}
                  checked={!!amenities[key]}
                  onCheckedChange={() => toggleBool(key)}
                />
                <Label htmlFor={key}>{label}</Label>
              </div>
            ) : (
              amenities[key] ? (
                <span>{label}</span>
              ) : (
                <span className="text-gray-400 line-through text-sm">{label}</span>
              )
            )}
          </div>
        ))}
      </div>

      {/* Distance amenities */}
      <div>
        <h3 className="font-semibold mb-3">Наблизо</h3>
        <div className="grid grid-cols-2 gap-3">
          {DISTANCE_AMENITIES.map(({ key, label, emoji }) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <span className="text-xl">{emoji}</span>
              {editing ? (
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-xs text-gray-600 shrink-0">{label.split(' ')[0]}:</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={amenities[key] ?? ''}
                    onChange={(e) => setDistance(key, e.target.value)}
                    placeholder="км"
                    className="h-7 text-xs w-20"
                  />
                </div>
              ) : (
                amenities[key] ? (
                  <span>{label.split(' ')[0]}: {amenities[key]} км</span>
                ) : (
                  <span className="text-gray-400 text-xs">{label.split(' ')[0]}: —</span>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}