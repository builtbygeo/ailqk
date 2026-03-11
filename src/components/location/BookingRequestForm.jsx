import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, X } from 'lucide-react';
import { toast } from 'sonner';

export default function BookingRequestForm({ location, user, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    arrival_date: '',
    departure_date: '',
    message: '',
    number_of_people: 2,
    vehicle_type: user.vehicle_type || 'camper',
    guest_name: user.full_name || '',
    guest_phone: user.phone || ''
  });

  const createBookingMutation = useMutation({
    mutationFn: (data) => base44.entities.BookingRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['myBookings']);
      toast.success('Заявката е изпратена успешно! Домакинът ще се свърже с вас.');
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    createBookingMutation.mutate({
      ...formData,
      location_id: location.id,
      location_name: location.name,
      host_email: location.host_email,
      guest_email: user.email,
      number_of_people: parseInt(formData.number_of_people)
    });
  };

  return (
    <Card className="mb-6 border-green-200">
      <CardHeader className="bg-green-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Заяви резервация
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Дата на пристигане *</Label>
              <Input
                type="date"
                required
                value={formData.arrival_date}
                onChange={(e) => setFormData({...formData, arrival_date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label>Дата на заминаване *</Label>
              <Input
                type="date"
                required
                value={formData.departure_date}
                onChange={(e) => setFormData({...formData, departure_date: e.target.value})}
                min={formData.arrival_date || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Брой хора *</Label>
              <Input
                type="number"
                min="1"
                required
                value={formData.number_of_people}
                onChange={(e) => setFormData({...formData, number_of_people: e.target.value})}
              />
            </div>
            <div>
              <Label>Превозно средство *</Label>
              <Select value={formData.vehicle_type} onValueChange={(val) => setFormData({...formData, vehicle_type: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="camper">🚐 Кемпер</SelectItem>
                  <SelectItem value="van">🚙 Бус</SelectItem>
                  <SelectItem value="caravan">🚚 Каравана</SelectItem>
                  <SelectItem value="other">🚗 Друго</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Вашето име</Label>
            <Input
              value={formData.guest_name}
              onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
              placeholder="Име"
            />
          </div>

          <div>
            <Label>Телефон за контакт</Label>
            <Input
              value={formData.guest_phone}
              onChange={(e) => setFormData({...formData, guest_phone: e.target.value})}
              placeholder="+359..."
            />
          </div>

          <div>
            <Label>Съобщение до домакина</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="Разкажете малко за себе си и целта на посещението..."
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={createBookingMutation.isPending}>
            {createBookingMutation.isPending ? 'Изпращане...' : 'Изпрати заявка'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}