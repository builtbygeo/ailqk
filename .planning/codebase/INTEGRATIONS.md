# INTEGRATIONS.md — External Services & APIs

## Authentication — Clerk

**Package:** `@clerk/nextjs ^7.0.4`

### Configuration
- **Provider:** `ClerkProvider` in `src/app/layout.tsx` wraps entire app
- **Middleware:** `src/proxy.ts` — `clerkMiddleware()` with catch-all matcher
- **Keyless dev mode:** `.clerk/.tmp/keyless.json` — auto-provisioned key for local dev

### Usage Patterns
```ts
// Server Component — get current user
import { currentUser } from '@clerk/nextjs/server';
const user = await currentUser();
// user.id, user.fullName, user.username, user.primaryEmailAddress

// Client Component — check auth state
import { useAuth, UserButton } from '@clerk/nextjs';
const { isSignedIn } = useAuth();
```

### Protected Routes
- Middleware runs on all routes except Next.js internals and static files
- No explicit `auth().protect()` calls — app is currently permissive (anonymous access works for reads)
- Reviews are posted under `user?.id || 'anonymous'` — no hard auth enforcement

---

## Database — Turso (SQLite via libSQL)

**Package:** `@libsql/client ^0.17.0` + `drizzle-orm ^0.45.1`

### Configuration
```ts
// src/db/index.ts
const client = createClient({
  url: process.env.DATABASE_URL || 'file:./local.db',
});
export const db = drizzle(client, { schema });
```

- **Local dev:** `DATABASE_URL` unset → uses SQLite file `local.db` in project root
- **Production:** `DATABASE_URL` should be a Turso `libsql://` URL with auth token

### Schema Tables
| Table | Purpose |
|---|---|
| `spots` | Camping/wild spots — id, name, desc, lat/lng, type, region, imageUrl, avgRating, reviewsCount, status, legalStatus, riskLevel, createdAt |
| `amenities` | 1-to-1 with spots — water, shade, flatGround, cellSignal, firePit, petFriendly, toilet, electricity, wifi (boolean integers) |
| `reviews` | User reviews — id, spotId, userId, userName, rating (int), comment, createdAt |

### Query Examples
```ts
// Load all spots
const allSpots = await db.select().from(spots);

// Load amenities for spot
const spotAmenities = await db.select().from(amenities).where(eq(amenities.spotId, spot.id)).get();

// Insert spot + amenities
await db.insert(spots).values({...});
await db.insert(amenities).values({spotId, ...amenityBooleans});

// Update rating after review
await db.update(spots).set({ averageRating: avg, reviewsCount: count }).where(eq(spots.id, spotId));
```

---

## Map Tiles — OpenStreetMap

**Provider:** OpenStreetMap (free, no API key required)

```tsx
// Used in MainMap.tsx via react-leaflet
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution='© OpenStreetMap contributors'
/>
```

No rate limiting configuration. For production at scale, consider switching to Mapbox or a self-hosted tile server.

---

## Image Hosting — Unsplash (Static Links)

All spot images in `src/data/bulgaria.ts` (seed data) use **static Unsplash URLs**:
```
https://images.unsplash.com/photo-{id}?q=80&w=800
```
These are not API calls — just direct `<img src>` references. No Unsplash API key is used.

For user-uploaded images (`imageUrl` field on spots), no upload service is currently wired in the Next.js layer. The legacy `base44.integrations.Core.UploadFile` stub in `src/legacy/api/base44Client.js` returns a placeholder URL.

---

## Legacy / Removed Integrations

### Base44 (Removed)
The original app was built on the **Base44** no-code platform:
- `@base44/sdk` — entity CRUD, auth, LLM, file upload
- `@base44/vite-plugin` — Vite bundler plugin

All Base44 packages have been removed from `package.json`. A **mock stub** remains at:
- `src/legacy/api/base44Client.js` — Full mock implementing `auth`, `entities`, `integrations.Core.InvokeLLM`, `integrations.Core.UploadFile`, `appLogs`
- `src/api/base44Client.js` — Duplicate of the above at a non-legacy path

These mocks are **not used** by the Next.js app but are still imported by files in `src/legacy/`. The legacy files themselves are not bundled.

---

## Not Yet Integrated (Planned)

Based on the subscription page copy and `State.md` / planning phases:

| Service | Purpose | Status |
|---|---|---|
| **Stripe** | Subscription payments for "Ailyak Pro" plan | Not wired — subscription page is UI-only |
| **Turso** | Production SQLite cloud DB | Env var slot exists, not configured |
| **Image upload service** | User-uploaded spot images | Not wired — `imageUrl` accepts strings but no upload UI |
| **AI/LLM** | Location analysis, AI recommendations | Legacy feature via Base44, not ported to Next.js |
