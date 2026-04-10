"use client";

import React from 'react';
import { Star, User } from 'lucide-react';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date | null;
}

interface ReviewsListProps {
  reviews: Review[];
}

export default function ReviewsList({ reviews }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-gray-500 font-medium">Все още няма отзиви за това място. <br/> Бъди първият, който ще сподели мнение!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 leading-tight">{review.userName}</h4>
                <p className="text-xs text-gray-500 font-medium">
                  {review.createdAt ? format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: bg }) : 'Преди известно време'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-yellow-700 text-sm">{review.rating}</span>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed font-medium">
            {review.comment}
          </p>
        </div>
      ))}
    </div>
  );
}
