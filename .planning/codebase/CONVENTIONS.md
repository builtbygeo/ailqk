# CONVENTIONS.md — Coding Conventions & Patterns

## Language & Type Safety

- **TypeScript strict mode** — `"strict": true` in `tsconfig.json`
- **`allowJs: true`** — JSX files allowed (legacy); new code should be `.ts`/`.tsx`
- **`as any` abuse** — Several places use `as any` to bypass type safety:
  - `src/app/page.tsx:36` — `<MainMap initialLocations={spotsWithAmenities as any} />`
  - `src/app/map/page.tsx:36` — Same
  - `src/app/spots/[id]/page.tsx:167` — `<ReviewsList reviews={spotReviews as any} />`
  - `src/app/add/page.tsx:320` — `(formData.amenities as any)[amenity.key]`

---

## Component Patterns

### Server Component (default)
```tsx
// src/app/spots/[id]/page.tsx
import { db } from '@/db';
import { spots } from '@/db/schema';

export default async function SpotPage({ params }: { params: { id: string } }) {
  const spot = await db.select().from(spots).where(eq(spots.id, params.id)).get();
  return <div>{spot?.name}</div>;
}
```

### Client Component
```tsx
// Always explicit directive at top
"use client";

import { useState } from 'react';
export default function MainMap({ initialLocations }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  // ...
}
```

### Server Action
```ts
// src/app/actions.ts
"use server";

export async function addSpot(formData: any) {
  // Always try/catch with { success, error } return shape
  try {
    await db.insert(spots).values({...});
    revalidatePath('/map');
    return { success: true, id: spotId };
  } catch (error) {
    console.error('Error adding spot:', error);
    return { success: false, error: 'Грешка при запис.' };
  }
}
```

### Client → Server Action Bridge
```tsx
// Server wrapper that passes server-only data to client form
// src/components/location/ReviewFormWrapper.tsx
export default function ReviewFormWrapper({ locationId }: { locationId: string }) {
  return <ReviewForm locationId={locationId} />;  // Client component
}
```

---

## Styling Conventions

### Tailwind v4 Configuration
- `globals.css` uses `@import "tailwindcss"` (v4 syntax — not `@tailwind base/components/utilities`)
- Custom tokens in `@theme inline { }` block
- Utilities in `@layer utilities { }`
- CSS variables: `--background`, `--foreground`, `--primary` (green `#059669`)

### Class Patterns
- `rounded-2xl` / `rounded-3xl` — preferred border radius for cards/buttons
- `shadow-sm` for cards, `shadow-xl` for elevated overlays
- `font-black` / `font-bold` — heavy typography throughout (brand style)
- `tracking-tight` / `tracking-tighter` / `tracking-widest` — used intentionally
- `text-xs font-bold uppercase tracking-widest` — label style pattern
- `h-14 rounded-2xl` — standard button height

### shadcn Component Usage
All shadcn components are used directly from `src/components/ui/`:
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
```

---

## Import Conventions

- **Path alias:** `@/` maps to `src/` (defined in `tsconfig.json`)
- All imports use `@/` alias, never relative for cross-folder imports
- Lucide icons inline import:
  ```tsx
  import { MapPin, Star, Filter, Shield } from 'lucide-react';
  ```

---

## File Organization

- **UI pages** contain all business logic inline (no separate service/controller layer)
- **DB queries** are written directly in page files and actions — no repository pattern
- **No custom hooks** for data fetching in Next.js layer (RSC handles it)
- Types are defined inline or via Drizzle inference (no separate `types/` directory)

---

## Error Handling

### Server Actions
```ts
try {
  // ... mutation
  return { success: true };
} catch (error) {
  console.error('Error ...:', error);
  return { success: false, error: 'Bulgarian error message.' };
}
```

### Client Components
- `alert()` used directly in form validation (e.g., `ReviewForm.tsx` on missing rating)
- No toast/notification system used for action results yet
- Profile page has heavy `console.log('DEBUG: ...')` statements left from development

### Server Component Error Boundaries
- Profile page wraps entire render in `try/catch` and renders a fallback UI with error message

---

## Language / Localization

- **Bulgarian UI strings** everywhere — all user-facing text is in Bulgarian (BG)
- `<html lang="bg">` in root layout
- No i18n framework — strings are hardcoded

---

## Data ID Pattern

- `spots.id` — `crypto.randomUUID()` — UUID v4 strings
- `reviews.id` — `crypto.randomUUID()` — UUID v4 strings
- `amenities.id` — auto-increment integer

---

## Rating Aggregate Pattern

Reviews → update spot aggregate manually after insert:
```ts
const allReviews = await db.select().from(reviews).where(eq(reviews.spotId, spotId));
const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
await db.update(spots).set({ averageRating, reviewsCount }).where(eq(spots.id, spotId));
```
**No trigger/computed column** — manual recalculation on every review insert.

---

## Constants / Config

- Spot types: `'wild' | 'host'`
- Legal status: `'tolerated' | 'approved' | 'protected' | 'strict'`
- Risk level: `'low' | 'medium' | 'high' | 'extreme'`
- Spot status: `'pending' | 'approved' | 'rejected'`
- Map center: `[42.7339, 25.4858]` (Bulgaria)
- Map zoom: 8, minZoom: 6, maxBounds: Bulgaria bounding box

---

## What's Missing (Convention Gaps)

- No Zod validation in Server Actions — `formData: any` throughout
- No centralized error logging (just `console.error`)
- No loading states on map (Leaflet handles its own)
- No optimistic UI updates
- No consistent data-fetching abstraction (ad-hoc DB calls per page)
