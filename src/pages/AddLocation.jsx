import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, MapPin, Upload, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function AddLocation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'wild',
    latitude: '',
    longitude: '',
    address: '',
    region: '',
    images: [],
    amenities: {
      water: false,
      electricity: false,
      toilet: false,
      wifi: false,
      supermarket_distance: '',
      pharmacy_distance: '',
      hospital_distance: '',
      gas_station_distance: ''
    },
    host_phone: '',
    host_notes: ''
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => navigate(createPageUrl('Map')));
    
    // Check for coordinates in URL
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');
    
    if (lat && lng) {
      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng
      }));
    }
  }, []);

  const canAddHostedLocation = user?.subscription_tier === 'pro';

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const locationData = {
        ...data,
        host_email: user.email,
        status: 'pending'
      };
      return base44.entities.Location.create(locationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['locations']);
      toast.success('Мястото е добавено успешно! Очаква одобрение.');
      navigate(createPageUrl('Map'));
    }
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    
    const uploadedUrls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(file_url);
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls]
    }));
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      amenities: {
        ...formData.amenities,
        supermarket_distance: formData.amenities.supermarket_distance ? parseFloat(formData.amenities.supermarket_distance) : null,
        pharmacy_distance: formData.amenities.pharmacy_distance ? parseFloat(formData.amenities.pharmacy_distance) : null,
        hospital_distance: formData.amenities.hospital_distance ? parseFloat(formData.amenities.hospital_distance) : null,
        gas_station_distance: formData.amenities.gas_station_distance ? parseFloat(formData.amenities.gas_station_distance) : null
      }
    };
    createMutation.mutate(submitData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to={createPageUrl('Map')}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад към картата
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Добави ново място</CardTitle>
            <p className="text-gray-600">Сподели място за кемпер/бус паркиране</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Основна информация */}
              <div className="space-y-4">
                <div>
                  <Label>Тип място *</Label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wild">🏞️ Дивo място (свободен достъп)</SelectItem>
                      <SelectItem value="hosted" disabled={!canAddHostedLocation}>
                        🏡 Домакинско място (с резервация)
                        {!canAddHostedLocation && ' - само за Pro'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {!canAddHostedLocation && (
                    <p className="text-sm text-amber-600 mt-2">
                      💡 Надстрой до <Link to={createPageUrl('Subscription')} className="underline font-semibold">Айляк Pro</Link> за да добавяш частни/домакински места
                    </p>
                  )}
                </div>

                <div>
                  <Label>Име на мястото *</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="напр. Панорамна поляна край Рила"
                  />
                </div>

                <div>
                  <Label>Описание</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Опиши мястото, достъпа, особености..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Регион</Label>
                  <Input
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                    placeholder="напр. София, Пловдив, Варна..."
                  />
                </div>
              </div>

              {/* GPS координати */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  GPS координати *
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Latitude (ширина)</Label>
                    <Input
                      required
                      type="number"
                      step="0.000001"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      placeholder="42.123456"
                    />
                  </div>
                  <div>
                    <Label>Longitude (дължина)</Label>
                    <Input
                      required
                      type="number"
                      step="0.000001"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      placeholder="24.123456"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Адрес (незадължително)</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Пълен адрес или описание за достъп"
                  />
                </div>
              </div>

              {/* Удобства */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Удобства на място</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.amenities.water}
                      onCheckedChange={(checked) => setFormData({...formData, amenities: {...formData.amenities, water: checked}})}
                    />
                    <Label>💧 Вода</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.amenities.electricity}
                      onCheckedChange={(checked) => setFormData({...formData, amenities: {...formData.amenities, electricity: checked}})}
                    />
                    <Label>⚡ Електричество</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.amenities.toilet}
                      onCheckedChange={(checked) => setFormData({...formData, amenities: {...formData.amenities, toilet: checked}})}
                    />
                    <Label>🚽 Тоалетна</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.amenities.wifi}
                      onCheckedChange={(checked) => setFormData({...formData, amenities: {...formData.amenities, wifi: checked}})}
                    />
                    <Label>📶 WiFi</Label>
                  </div>
                </div>

                <h4 className="font-medium mt-6 mb-3">Близки обекти (разстояние в км)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>🛒 Супермаркет</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.amenities.supermarket_distance}
                      onChange={(e) => setFormData({...formData, amenities: {...formData.amenities, supermarket_distance: e.target.value}})}
                      placeholder="км"
                    />
                  </div>
                  <div>
                    <Label>💊 Аптека</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.amenities.pharmacy_distance}
                      onChange={(e) => setFormData({...formData, amenities: {...formData.amenities, pharmacy_distance: e.target.value}})}
                      placeholder="км"
                    />
                  </div>
                  <div>
                    <Label>🏥 Болница</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.amenities.hospital_distance}
                      onChange={(e) => setFormData({...formData, amenities: {...formData.amenities, hospital_distance: e.target.value}})}
                      placeholder="км"
                    />
                  </div>
                  <div>
                    <Label>⛽ Бензиностанция</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.amenities.gas_station_distance}
                      onChange={(e) => setFormData({...formData, amenities: {...formData.amenities, gas_station_distance: e.target.value}})}
                      placeholder="км"
                    />
                  </div>
                </div>
              </div>

              {/* Домакинска информация */}
              {formData.type === 'hosted' && (
                <div className="border-t pt-6 bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-4">Информация за домакини</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Телефон за контакт</Label>
                      <Input
                        value={formData.host_phone}
                        onChange={(e) => setFormData({...formData, host_phone: e.target.value})}
                        placeholder="+359..."
                      />
                    </div>
                    <div>
                      <Label>Допълнителна информация</Label>
                      <Textarea
                        value={formData.host_notes}
                        onChange={(e) => setFormData({...formData, host_notes: e.target.value})}
                        placeholder="Правила, цени, условия..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Снимки */}
              <div className="border-t pt-6">
                <Label>Снимки</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button type="button" variant="outline" disabled={uploading} asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? 'Качване...' : 'Качи снимки'}
                      </span>
                    </Button>
                  </label>
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {formData.images.map((url, idx) => (
                        <img key={idx} src={url} alt="" className="w-full h-24 object-cover rounded" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={createMutation.isPending}>
                <Check className="w-4 h-4 mr-2" />
                {createMutation.isPending ? 'Добавяне...' : 'Добави място'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}