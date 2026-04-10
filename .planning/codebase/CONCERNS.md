# CONCERNS.md — Technical Debt, Risks & Issues

## 🔴 Critical Issues

### 1. N+1 Query Problem (Performance)
**Files:** `src/app/page.tsx`, `src/app/map/page.tsx`

Both map pages fetch amenities with a separate query per spot:
```ts
const spotsWithAmenities = await Promise.all(
  allSpots.map(async (spot) => {
    const spotAmenities = await db.select().from(amenities)
      .where(eq(amenities.spotId, spot.id)).get();
    // ...
  })
);
```
With 50+ spots, this fires **50+ DB queries on every page load**. This will degrade severely as the spot count grows.

**Fix:** Use a single JOIN query:
```ts
const spotsWithAmenities = await db
  .select()
  .from(spots)
  .leftJoin(amenities, eq(amenities.spotId, spots.id));
```

---

### 2. No Input Validation on Server Actions
**File:** `src/app/actions.ts`

Both `addSpot()` and `addReview()` accept `formData: any` with zero Zod/type validation:
```ts
export async function addSpot(formData: any) {
  await db.insert(spots).values({
    name: formData.name,  // no validation
    latitude: parseFloat(formData.latitude),  // can be NaN
    // ...
  });
}
```
**Risk:** Malformed data, NaN coordinates, SQL injection vector (mitigated by Drizzle parameterized queries but logic bugs are possible).

**Fix:** Add Zod schema validation before any DB operations.

---

### 3. No Authentication Enforcement
**File:** `src/app/actions.ts`, `src/proxy.ts`

`addSpot()` has no auth check — anyone can POST spots. `addReview()` uses `currentUser()` but falls back to `'anonymous'` rather than rejecting.

```ts
const user = await currentUser();
userId: user?.id || 'anonymous',  // No enforcement
```

Middleware (`clerkMiddleware()`) runs globally but doesn't protect any specific routes.

**Risk:** Spam spots, anonymous reviews, data integrity issues.

---

### 4. Debug `console.log` Left in Production Code
**File:** `src/app/profile/page.tsx`

10 `console.log('DEBUG: ...')` and `console.error('DEBUG: ...')` statements are scattered throughout the profile page Server Component. These leak internal implementation details and pollute server logs.

---

## 🟡 Significant Tech Debt

### 5. Duplicate Routes
`src/app/page.tsx` and `src/app/map/page.tsx` are **identical files** — same imports, same data fetching, same JSX. Any change must be made twice. One should redirect to the other.

### 6. Dead `src/legacy/` Directory (~80 files)
The entire `src/legacy/` tree is unused by the Next.js app. It's a 80+ file artifact of the Vite/Base44 migration. It adds confusion, increases repo size, and the Base44 mock client (`src/legacy/api/base44Client.js`) still has `@/api/base44Client` import aliases that could confuse new devs.

Additionally, `src/api/base44Client.js` (at the root `src/api/` level) is a second copy not under `legacy/` — also dead.

### 7. Leftover VITE_ Env Vars
`.env.local` still contains:
```
VITE_BASE44_APP_ID=...
VITE_BASE44_APP_BASE_URL=...
```
These are unused by Next.js (VITE_ prefix doesn't work with Next.js) but contain potentially sensitive App IDs.

### 8. `as any` Type Escapes
Four instances of `as any` break type safety:
- `src/app/page.tsx:36` — `spotsWithAmenities as any`
- `src/app/map/page.tsx:36` — same
- `src/app/spots/[id]/page.tsx:167` — `spotReviews as any`
- `src/app/add/page.tsx:320` — `(formData.amenities as any)[amenity.key]`

Proper typed interfaces for spot+amenity joins should be defined.

### 9. Rating Aggregate — Manual Recalculation
Every review insert recalculates the average by loading ALL reviews for a spot:
```ts
const allReviews = await db.select().from(reviews).where(eq(reviews.spotId, spotId));
const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
```
This is O(n) reads on every review insert. Should use incremental update:
```sql
UPDATE spots SET average_rating = (average_rating * reviews_count + newRating) / (reviews_count + 1),
                 reviews_count = reviews_count + 1
WHERE id = spotId;
```

### 10. No Image Upload Solution
The `imageUrl` field on spots accepts a URL string, but there's no upload UI in the Next.js App. The legacy mock returned a placeholder URL. Users submitting in `/add` would need to provide a URL manually (if the form even exposes that field).

---

## 🟠 Security Concerns

### 11. Spot Status Defaults to `'approved'`  
```ts
status: "pending",  // in addSpot() — this is correct
```
Wait — the code does set `pending` on insert. But **there's no admin approval UI** in the Next.js app. The legacy `pages/LocationDetails.jsx` had admin controls. Currently, there's no way to approve spots without direct DB manipulation.

**Impact:** Spots submitted via `/add` are permanently `pending` with no UI to approve them. The map only shows spots where `status = 'approved'` if filtering is applied (needs verification in `MainMap.tsx`).

### 12. Clerk Auth Without Route Protection
Any server action or page can be accessed without authentication because `clerkMiddleware()` uses a permissive default matcher. If a user somehow calls an action directly without a session, they can submit spots/reviews as `'anonymous'`.

### 13. No Rate Limiting
No rate limiting on spot submissions or reviews. A single user could flood the database.

---

## 🔵 UX / Product Gaps

### 14. Subscription Page Is UI-Only
The "Ailyak Pro" subscription page (`/subscription`) has beautiful pricing UI but **no payment processing**. No Stripe integration. No actual subscription status tracked on user or DB.

### 15. Profile Stats Are Partially Hardcoded
```tsx
{ icon: Star, label: 'Рейтинг', value: '4.9', ... },     // Hardcoded!
{ icon: ImageIcon, label: 'Снимки', value: '12', ... },   // Hardcoded!
```
Only spot count and review count are fetched dynamically; rating and photo count are hardcoded.

### 16. My Spots Section on Profile Is Empty Shell
The "Моите Места" section on profile always shows the empty state regardless of actual user spots. The component doesn't fetch or render the user's actual spots.

### 17. Experiences Page (Stub)
`src/app/experiences/page.tsx` appears to exist but its content is unknown (truncated in exploration). The legacy version used AI recommendations via Base44 LLM integration — this likely needs a full reimplementation.

---

## 🟢 Low Priority / Nice-to-have

### 18. Missing `DATABASE_URL` Environment Variable
No production database is configured. `local.db` is the only data store. A Turso account and connection string are needed for production.

### 19. No CI/CD Pipeline
No `.github/workflows/` or any CI configuration. Tests can't be automated.

### 20. `scripts/seed.ts` Not Integrated with Drizzle Migrations
The seed script exists but it's not clear if it runs idempotently. Running it twice would likely cause primary key conflicts.

### 21. Next.js Config is Empty
`next.config.ts` has no configuration at all. Missing: image domains for Unsplash, bundle optimization.
