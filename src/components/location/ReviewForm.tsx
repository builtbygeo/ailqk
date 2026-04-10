"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Send, X } from 'lucide-react';
import { addReview } from '@/app/actions';

interface ReviewFormProps {
  locationId: string;
  onClose: () => void;
}

export default function ReviewForm({ locationId, onClose }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Моля, изберете рейтинг');
      return;
    }
    
    setIsSubmitting(true);
    const result = await addReview({
      spotId: locationId,
      rating,
      comment,
    });
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-inner mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">Напиши отзив</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full w-8 h-8 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-bold text-gray-700 ml-1">Твоят рейтинг *</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform active:scale-90"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-200 fill-gray-100'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-bold text-gray-700 ml-1">Коментар</Label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Сподели мнението си за мястото, пътя или атмосферата..."
            className="rounded-2xl border-gray-100 bg-white min-h-[120px] p-6 font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-green-500/20 transition-all"
            rows={4}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting || rating === 0}
          className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-100 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Публикуване...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Публикувай отзива
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}
