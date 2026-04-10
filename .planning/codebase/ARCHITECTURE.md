# ARCHITECTURE.md — System Architecture

## Pattern

**Next.js 16 App Router — Hybrid RSC + Client Islands**

The architecture follows the React Server Components model:
- Pages are **async Server Components** by default — fetch data server-side, render HTML
- Interactive UI elements are **Client Components** (explicit `"use client"` directive)
- Data mutations use **Next.js Server Actions** (`"use server"`)
- No API routes currently — all server logic runs in Server Components or Server Actions

---

## Layer Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Next.js App Router                    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Server Layer (RSC)                  │  │
│  │  src/app/**/page.tsx  ←  async Server Components │  │
│  │  src/app/actions.ts   ←  Server Actions          │  │
│  │  src/db/index.ts      ←  Drizzle ORM + libSQL    │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓  props (serialized)          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Client Layer                        │  │
│  │  src/components/map/MainMap.tsx  ← "use client"  │  │
│  │  src/components/map/MapContent.tsx               │  │
│  │  src/components/location/ReviewForm.tsx          │  │
│  │  src/components/UserNav.tsx                      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Shared / Static                        │  │
│  │  src/components/ui/   ← shadcn components        │  │
│  │  src/data/bulgaria.ts ← GeoJSON + constants      │  │
│  │  src/db/schema.ts     ← Drizzle schema           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Read Path (Map Page)
```
Browser Request
  → Next.js Server (SSR)
    → src/app/page.tsx (or /map/page.tsx) — async Server Component
      → db.select().from(spots) — Drizzle → libSQL → local.db / Turso
      → db.select().from(amenities).where(...)
      → Promise.all() — N+1 queries for amenities (one per spot ⚠️)
    → serializes spotsWithAmenities array as props
    → <MainMap initialLocations={...} />
      → Client hydration with leaflet markers
```

### Write Path (Add Spot, Add Review)
```
User submits form
  → Client Component calls Server Action
    → src/app/actions.ts#addSpot() / addReview()
      → db.insert(spots/reviews) — Drizzle → libSQL
      → revalidatePath('/map' or '/spots/[id]')
    → Next.js revalidates cached page data
  → UI updates (redirect or state change)
```

---

## Entry Points

| Entry Point | Description |
|---|---|
| `src/app/layout.tsx` | Root layout — `ClerkProvider`, `Outfit` font, `globals.css` |
| `src/app/page.tsx` | Root page (map view) — duplicates `/map` route |
| `src/proxy.ts` | Next.js middleware — Clerk auth wrapper |
| `src/db/index.ts` | Database singleton — Drizzle client |

---

## Key Abstractions

### Server Actions (`src/app/actions.ts`)
Single file for all mutations. Pattern:
```ts
"use server";
export async function addSpot(formData: any) {
  // validate, insert, revalidate
}
export async function addReview(data: any) {
  // validate, insert, update rating aggregate, revalidate
}
```
**Weakness:** No Zod validation, no auth guard — `formData: any` types throughout.

### Database (`src/db/`)
- `schema.ts` — Single-file schema with 3 tables
- `index.ts` — Singleton `db` export — imported directly by pages and actions

### Map Component Architecture
```
MainMap.tsx ("use client")
  └── state: searchTerm, filterType, filterRisk, selectedPosition
  └── MapContainer (react-leaflet)
       └── TileLayer (OSM tiles)
       └── GeoJSON (world mask + Bulgaria border)
       └── MapClickHandler.tsx — captures click position
       └── Marker[] — one per filteredLocation
            └── Popup — card with spot info + link to details
```

### Spot Details Page (`src/app/spots/[id]/page.tsx`)
- Server Component fetching spot + amenities + reviews
- Renders `ReviewsList` (server) and `ReviewFormWrapper` → `ReviewForm` (client)
- `ReviewFormWrapper` is a thin client bridge to pass `locationId` into the client form

---

## Authentication Architecture

```
ClerkProvider (layout)
  → clerkMiddleware (proxy.ts) — runs every request
    → currentUser() in Server Components → Clerk API call
    → useAuth() in Client Components → Clerk context
```

Auth is **permissive** — no `auth().protect()` enforced. Unauthenticated users can view all spots. Reviews attributed to `'anonymous'` if no user. No RBAC.

---

## Routing Map

| Route | Component | Type |
|---|---|---|
| `/` | `src/app/page.tsx` | Server (duplicates `/map`) |
| `/map` | `src/app/map/page.tsx` | Server → Client (MainMap) |
| `/spots/[id]` | `src/app/spots/[id]/page.tsx` | Server + Client islands |
| `/add` | `src/app/add/page.tsx` | Client (`"use client"`) |
| `/profile` | `src/app/profile/page.tsx` | Server (Clerk user data) |
| `/subscription` | `src/app/subscription/page.tsx` | Static Server Component |
| `/manifesto` | `src/app/manifesto/page.tsx` | Static Server Component |
| `/experiences` | `src/app/experiences/page.tsx` | (likely stub) |

---

## Legacy Architecture (Archived)

`src/legacy/` contains the original **Vite + React SPA** architecture:
- Single-page app with React Router
- Base44 SDK for auth, entities, integrations (AI, file upload)
- All components were JSX with no TypeScript

This layer is **dead code** — not imported by Next.js. Migration from Vite SPA to Next.js App Router is ~80% complete.
