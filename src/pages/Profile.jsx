import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, MapPin, Calendar, LogOut, Crown, Settings, Image, MessageSquare, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    display_name: '',
    vehicle_type: '',
    vehicle_details: '',
    is_host: false
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setFormData({
        full_name: u.full_name || '',
        phone: u.phone || '',
        bio: u.bio || '',
        display_name: u.display_name || '',
        vehicle_type: u.vehicle_type || '',
        vehicle_details: u.vehicle_details || '',
        is_host: u.is_host || false
      });
    }).catch(() => navigate(createPageUrl('Map')));
  }, []);

  const { data: myLocations = [] } = useQuery({
    queryKey: ['myLocations', user?.email],
    queryFn: () => base44.entities.Location.filter({ created_by: user.email }),
    enabled: !!user
  });

  const { data: myBookings = [] } = useQuery({
    queryKey: ['myBookings', user?.email],
    queryFn: () => base44.entities.BookingRequest.filter({ guest_email: user.email }),
    enabled: !!user
  });

  const { data: hostBookings = [] } = useQuery({
    queryKey: ['hostBookings', user?.email],
    queryFn: () => base44.entities.BookingRequest.filter({ host_email: user.email }),
    enabled: !!user
  });

  const { data: pendingLocations = [] } = useQuery({
    queryKey: ['pendingLocations'],
    queryFn: () => base44.entities.Location.filter({ status: 'pending' }),
    enabled: !!user && user.role === 'admin'
  });

  const { data: myReviews = [] } = useQuery({
    queryKey: ['myReviews', user?.email],
    queryFn: () => base44.entities.Review.filter({ created_by: user.email }),
    enabled: !!user
  });

  // Calculate total images uploaded by user
  const totalImages = React.useMemo(() => {
    let count = 0;
    // Count images from locations
    myLocations.forEach(loc => {
      if (loc.images && Array.isArray(loc.images)) {
        count += loc.images.length;
      }
    });
    // Count images from reviews
    myReviews.forEach(review => {
      if (review.images && Array.isArray(review.images)) {
        count += review.images.length;
      }
    });
    return count;
  }, [myLocations, myReviews]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      toast.success('Профилът е актуализиран');
      setEditMode(false);
      base44.auth.me().then(setUser);
    }
  });

  const approveLocationMutation = useMutation({
    mutationFn: (locationId) => base44.entities.Location.update(locationId, { status: 'approved' }),
    onSuccess: () => {
      toast.success('Мястото е одобрено');
      queryClient.invalidateQueries(['pendingLocations']);
      queryClient.invalidateQueries(['locations']);
    }
  });

  const rejectLocationMutation = useMutation({
    mutationFn: (locationId) => base44.entities.Location.update(locationId, { status: 'rejected' }),
    onSuccess: () => {
      toast.success('Мястото е отхвърлено');
      queryClient.invalidateQueries(['pendingLocations']);
    }
  });

  const approveBookingMutation = useMutation({
    mutationFn: ({ bookingId, response }) => base44.entities.BookingRequest.update(bookingId, { 
      status: 'approved',
      host_response: response 
    }),
    onSuccess: () => {
      toast.success('Резервацията е одобрена');
      queryClient.invalidateQueries(['hostBookings']);
    }
  });

  const rejectBookingMutation = useMutation({
    mutationFn: ({ bookingId, response }) => base44.entities.BookingRequest.update(bookingId, { 
      status: 'rejected',
      host_response: response 
    }),
    onSuccess: () => {
      toast.success('Резервацията е отказана');
      queryClient.invalidateQueries(['hostBookings']);
    }
  });

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <Link to={createPageUrl('Map')}>
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
          <div className="flex gap-3">
            <Link to={createPageUrl('Subscription')}>
              <Button variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-50">
                <Crown className="w-4 h-4 mr-2" />
                {user.subscription_tier === 'pro' ? 'Pro профил' : 'Надстрой до Pro'}
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Изход
            </Button>
          </div>
        </div>

        <Card className="mb-6 border-t-4 border-green-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-6 h-6" />
                Моят профил
              </CardTitle>
              {user.subscription_tier === 'pro' && (
                <Badge className="bg-amber-500 text-white">
                  <Crown className="w-4 h-4 mr-1" />
                  Pro
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!editMode ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Име</p>
                  <p className="font-medium">{user.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                {user.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Телефон</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                )}
                {user.display_name && (
                  <div>
                    <p className="text-sm text-gray-500">Публично показвано име</p>
                    <p className="font-medium">{user.display_name}</p>
                  </div>
                )}
                {user.vehicle_type && (
                  <div>
                    <p className="text-sm text-gray-500">Превозно средство</p>
                    <p className="font-medium">
                      {user.vehicle_type === 'camper' && '🚐 Кемпер'}
                      {user.vehicle_type === 'van' && '🚙 Бус'}
                      {user.vehicle_type === 'caravan' && '🚚 Каравана'}
                      {user.vehicle_type === 'other' && '🚗 Друго'}
                    </p>
                    {user.vehicle_details && (
                      <p className="text-sm text-gray-600 mt-1">{user.vehicle_details}</p>
                    )}
                  </div>
                )}
                {user.bio && (
                  <div>
                    <p className="text-sm text-gray-500">За мен</p>
                    <p className="font-medium">{user.bio}</p>
                  </div>
                )}
                <Button onClick={() => setEditMode(true)} className="bg-green-600 hover:bg-green-700">
                  Редактирай профила
                </Button>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate(formData);
              }} className="space-y-4">
                <div>
                  <Label>Име</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Вашето име"
                  />
                </div>
                <div>
                  <Label>Публично показвано име (при добавени места)</Label>
                  <Input
                    value={formData.display_name}
                    onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                    placeholder="Напр. Ваньо от Пловдив"
                  />
                  <p className="text-xs text-gray-500 mt-1">Това е името, което се вижда на страницата на всяко твое място.</p>
                </div>
                <div>
                  <Label>Телефон</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+359..."
                  />
                </div>
                <div>
                  <Label>Превозно средство</Label>
                  <Select value={formData.vehicle_type} onValueChange={(val) => setFormData({...formData, vehicle_type: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Избери" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camper">🚐 Кемпер</SelectItem>
                      <SelectItem value="van">🚙 Бус</SelectItem>
                      <SelectItem value="caravan">🚚 Каравана</SelectItem>
                      <SelectItem value="other">🚗 Друго</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Детайли за възилото (опционално)</Label>
                  <Textarea
                    value={formData.vehicle_details}
                    onChange={(e) => setFormData({...formData, vehicle_details: e.target.value})}
                    placeholder="Напр. марка, модел, капацитет..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label>За мен</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Разкажи малко за себе си..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Запази
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                    Отказ
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              📊 Моята активност
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <div className="text-2xl font-bold text-green-700">{myLocations.length}</div>
                </div>
                <div className="text-xs text-gray-600">Добавени места</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-700">{myReviews.length}</div>
                </div>
                <div className="text-xs text-gray-600">Написани отзива</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Image className="w-5 h-5 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-700">{totalImages}</div>
                </div>
                <div className="text-xs text-gray-600">Качени снимки</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-amber-600" />
                  <div className="text-2xl font-bold text-amber-700">
                    {myLocations.reduce((sum, loc) => sum + (loc.reviews_count || 0), 0)}
                  </div>
                </div>
                <div className="text-xs text-gray-600">Получени отзиви</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {user.subscription_tier === 'pro' && myLocations.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-600" />
                Pro Статистика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700">{myLocations.filter(l => l.type === 'hosted').length}</div>
                  <div className="text-sm text-gray-600">Домакински места</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-700">
                    {hostBookings.length}
                  </div>
                  <div className="text-sm text-gray-600">Получени заявки</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">
                    {hostBookings.filter(b => b.status === 'approved').length}
                  </div>
                  <div className="text-sm text-gray-600">Одобрени резервации</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="locations">
          <TabsList className={`grid w-full ${user.role === 'admin' ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="locations">
              <MapPin className="w-4 h-4 mr-2" />
              Моите места ({myLocations.length})
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Calendar className="w-4 h-4 mr-2" />
              Мои заявки ({myBookings.length})
            </TabsTrigger>
            <TabsTrigger value="host">
              🏡 Като домакин ({hostBookings.length})
            </TabsTrigger>
            {user.role === 'admin' && (
              <TabsTrigger value="admin">
                ⚙️ Одобрения ({pendingLocations.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="locations">
            <Card>
              <CardContent className="pt-6">
                {myLocations.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Все още нямате добавени места</p>
                ) : (
                  <div className="space-y-3">
                    {myLocations.map(loc => (
                      <div key={loc.id} className="border p-4 rounded-lg">
                        <h3 className="font-bold">{loc.name}</h3>
                        <p className="text-sm text-gray-600">{loc.region}</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            loc.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            loc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {loc.status === 'approved' ? '✓ Одобрено' : loc.status === 'pending' ? '⏳ Очаква одобрение' : '✗ Отхвърлено'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardContent className="pt-6">
                {myBookings.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Все още нямате заявки за резервации</p>
                ) : (
                  <div className="space-y-3">
                    {myBookings.map(booking => (
                      <div key={booking.id} className="border p-4 rounded-lg">
                        <h3 className="font-bold">{booking.location_name}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.arrival_date).toLocaleDateString('bg-BG')} - {new Date(booking.departure_date).toLocaleDateString('bg-BG')}
                        </p>
                        <span className={`inline-block text-xs px-2 py-1 rounded mt-2 ${
                          booking.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status === 'approved' ? '✓ Одобрена' : 
                           booking.status === 'pending' ? '⏳ Очаква отговор' : 
                           booking.status === 'rejected' ? '✗ Отказана' : '⊗ Отменена'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="host">
            <Card>
              <CardContent className="pt-6">
                {hostBookings.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Нямате заявки като домакин</p>
                ) : (
                  <div className="space-y-4">
                    {hostBookings.map(booking => (
                      <div key={booking.id} className="border p-4 rounded-lg bg-white">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{booking.location_name}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              👤 {booking.guest_name || booking.guest_email}
                            </p>
                            {booking.guest_phone && (
                              <p className="text-sm text-gray-600">📞 {booking.guest_phone}</p>
                            )}
                            <p className="text-sm font-medium text-gray-700 mt-2">
                              📅 {new Date(booking.arrival_date).toLocaleDateString('bg-BG')} - {new Date(booking.departure_date).toLocaleDateString('bg-BG')}
                            </p>
                            {booking.number_of_people && (
                              <p className="text-sm text-gray-600">👥 {booking.number_of_people} човека</p>
                            )}
                            {booking.vehicle_type && (
                              <p className="text-sm text-gray-600">🚐 {booking.vehicle_type}</p>
                            )}
                            {booking.message && (
                              <div className="mt-2 p-2 bg-gray-50 rounded">
                                <p className="text-sm italic">"{booking.message}"</p>
                              </div>
                            )}
                            {booking.host_response && (
                              <div className="mt-2 p-2 bg-blue-50 rounded">
                                <p className="text-xs font-semibold text-blue-900">Твой отговор:</p>
                                <p className="text-sm">{booking.host_response}</p>
                              </div>
                            )}
                          </div>
                          <Badge className={
                            booking.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }>
                            {booking.status === 'approved' ? '✓ Одобрена' :
                             booking.status === 'pending' ? '⏳ Чака' :
                             booking.status === 'rejected' ? '✗ Отказана' : '⊗ Отменена'}
                          </Badge>
                        </div>
                        {booking.status === 'pending' && (
                          <div className="mt-4 flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                const response = prompt('Съобщение към госта (опционално):');
                                approveBookingMutation.mutate({ bookingId: booking.id, response: response || '' });
                              }}
                            >
                              ✓ Одобри
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                const response = prompt('Причина за отказ (опционално):');
                                rejectBookingMutation.mutate({ bookingId: booking.id, response: response || '' });
                              }}
                            >
                              ✗ Откажи
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {user.role === 'admin' && (
            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle>Места за одобрение</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingLocations.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Няма места за одобрение</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingLocations.map(loc => (
                        <div key={loc.id} className="border p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg">{loc.name}</h3>
                              <p className="text-sm text-gray-600">{loc.type === 'wild' ? '🏞️ Дивo място' : '🏡 Домакинско място'}</p>
                              <p className="text-sm text-gray-600">{loc.region}</p>
                              {loc.description && <p className="text-sm mt-2">{loc.description}</p>}
                              <p className="text-xs text-gray-500 mt-2">Добавено от: {loc.created_by}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => approveLocationMutation.mutate(loc.id)}
                                disabled={approveLocationMutation.isPending}
                              >
                                ✓ Одобри
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectLocationMutation.mutate(loc.id)}
                                disabled={rejectLocationMutation.isPending}
                              >
                                ✗ Отхвърли
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}