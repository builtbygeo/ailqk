"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ReviewForm from './ReviewForm';

interface ReviewFormWrapperProps {
  locationId: string;
}

export default function ReviewFormWrapper({ locationId }: ReviewFormWrapperProps) {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return <ReviewForm locationId={locationId} onClose={() => setShowForm(false)} />;
  }

  return (
    <Button 
      onClick={() => setShowForm(true)} 
      className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
    >
      Напиши отзив
    </Button>
  );
}
