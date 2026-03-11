import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewForm({ locationId, onClose }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const createReviewMutation = useMutation({
    mutationFn: async (data) => {
      const review = await base44.entities.Review.create(data);
      
      // Update location's average rating
      const reviews = await base44.entities.Review.filter({ location_id: locationId });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      
      await base44.entities.Location.update(locationId, {
        average_rating: avgRating,
        reviews_count: reviews.length
      });
      
      return review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', locationId]);
      queryClient.invalidateQueries(['location', locationId]);
      toast.success('Отзивът е добавен успешно!');
      onClose();
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
    
    setImages([...images, ...uploadedUrls]);
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Моля, изберете рейтинг');
      return;
    }
    
    createReviewMutation.mutate({
      location_id: locationId,
      rating,
      comment,
      images,
      visit_date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="border-b pb-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Рейтинг *</Label>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 cursor-pointer transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>

        <div>
          <Label>Коментар</Label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Сподели впечатленията си от мястото..."
            rows={4}
          />
        </div>

        <div>
          <Label>Снимки</Label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="review-image-upload"
          />
          <label htmlFor="review-image-upload">
            <Button type="button" variant="outline" disabled={uploading} asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Качване...' : 'Добави снимки'}
              </span>
            </Button>
          </label>
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {images.map((url, idx) => (
                <div key={idx} className="relative">
                  <img src={url} alt="" className="w-full h-20 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={createReviewMutation.isPending}>
            {createReviewMutation.isPending ? 'Добавяне...' : 'Публикувай отзив'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Отказ
          </Button>
        </div>
      </form>
    </div>
  );
}