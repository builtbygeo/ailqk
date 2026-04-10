# STRUCTURE.md — Directory Layout & Organization

## Root Directory

```
ailqk/
├── .clerk/             # Clerk keyless dev setup
│   └── .tmp/keyless.json
├── .env.local          # Secret env vars (gitignored)
├── .gitignore
├── .next/              # Next.js build output (gitignored)
├── .planning/          # GSD planning artifacts
│   ├── codebase/       # This codebase map
│   └── phases/         # Phase plans 01-04
├── drizzle.config.ts   # Drizzle ORM config
├── drizzle/            # Migration SQL files (if generated)
├── eslint.config.mjs   # ESLint (next/core-web-vitals + TS)
├── local.db            # SQLite dev database
├── next-env.d.ts       # Next.js TS types (auto-generated)
├── next.config.ts      # Next.js config (minimal)
├── node_modules/
├── package.json
├── package-lock.json
├── postcss.config.mjs  # PostCSS (Tailwind v4)
├── public/             # Static assets
│   ├── logo.png
│   ├── marker-icon.png         # Leaflet marker icons
│   ├── marker-icon-2x.png
│   ├── marker-shadow.png
│   ├── layers.png / layers-2x.png
│   └── *.svg                   # Next.js boilerplate SVGs
├── README.md
├── scripts/
│   └── seed.ts         # DB seeding script
├── src/                # All application source
├── State.md            # Project state notes (manual)
└── tsconfig.json
```

---

## `src/` Directory

```
src/
├── api/
│   └── base44Client.js     # Legacy mock (not used by Next.js)
├── app/                    # Next.js App Router (main codebase)
│   ├── actions.ts          # All Server Actions ("use server")
│   ├── add/
│   │   └── page.tsx        # Add new spot form (client)
│   ├── experiences/
│   │   └── page.tsx        # Experiences page (stub)
│   ├── favicon.ico
│   ├── globals.css         # Tailwind v4 + custom CSS
│   ├── layout.tsx          # Root layout (Clerk, font, CSS)
│   ├── manifesto/
│   │   └── page.tsx        # Static manifesto page
│   ├── map/
│   │   └── page.tsx        # /map route (same as root)
│   ├── page.tsx            # Root route (same as /map)
│   ├── profile/
│   │   └── page.tsx        # User profile (needs Clerk user)
│   ├── spots/
│   │   └── [id]/
│   │       └── page.tsx    # Spot detail page
│   └── subscription/
│       └── page.tsx        # Ailyak Pro subscription page
│
├── components/
│   ├── UserNav.tsx         # Clerk UserButton wrapper (client)
│   ├── location/
│   │   ├── ReviewForm.tsx          # Star rating + comment form (client)
│   │   ├── ReviewFormWrapper.tsx   # Server→client bridge
│   │   └── ReviewsList.tsx         # Display reviews list
│   ├── map/
│   │   ├── MainMap.tsx             # Main map shell (client, "use client")
│   │   ├── MapClickHandler.tsx     # Leaflet click event handler
│   │   └── MapContent.tsx          # Map content (spot detail panel?)
│   └── ui/                         # shadcn/ui components (49 files)
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── toast.tsx
│       ├── use-toast.tsx
│       └── ... (39 more)
│
├── data/
│   ├── bulgaria.js         # Legacy JS version (used by legacy)
│   └── bulgaria.ts         # TypeScript GeoJSON for Bulgaria border
│                           # + worldMask polygon + 50 seed locations
│
├── db/
│   ├── index.ts            # Drizzle client singleton (db export)
│   └── schema.ts           # 3 tables: spots, amenities, reviews
│
├── hooks/
│   └── use-mobile.jsx      # Breakpoint hook (tailwind md: check)
│
├── legacy/                 # Original Vite SPA (dead code)
│   ├── App.jsx             # Vite app root (unused)
│   ├── Layout.jsx          # Legacy layout with sidebar nav
│   ├── api/base44Client.js # Full Base44 mock SDK
│   ├── components/
│   │   ├── UserNotRegisteredError.jsx
│   │   ├── experiences/AIRecommendations.jsx
│   │   ├── location/
│   │   │   ├── AILocationAnalysis.jsx
│   │   │   ├── AmenitiesManager.jsx
│   │   │   ├── BookingRequestForm.jsx
│   │   │   ├── ReviewForm.jsx
│   │   │   └── ReviewsList.jsx
│   │   ├── map/MapClickHandler.jsx
│   │   └── ui/             # JSX copies of all shadcn components
│   ├── data/bulgaria.js
│   ├── hooks/use-mobile.jsx
│   ├── index.css           # Legacy CSS
│   ├── lib/
│   │   ├── AuthContext.jsx      # Mock auth context
│   │   ├── NavigationTracker.jsx
│   │   ├── PageNotFound.jsx
│   │   ├── app-params.js
│   │   ├── query-client.js
│   │   └── utils.js
│   ├── main.jsx            # Vite app entry
│   ├── pages/              # Page components (SPA routing)
│   │   ├── AddLocation.jsx
│   │   ├── Experiences.jsx
│   │   ├── LocationDetails.jsx
│   │   ├── Manifesto.jsx
│   │   ├── Map.jsx
│   │   ├── Profile.jsx
│   │   └── Subscription.jsx
│   ├── pages.config.js     # SPA routing config (Base44 format)
│   └── utils/index.js
│
└── proxy.ts                # Next.js Clerk middleware
```

---

## Key File Locations (Quick Reference)

| What | Where |
|---|---|
| Root layout + fonts | `src/app/layout.tsx` |
| Global CSS + Tailwind config | `src/app/globals.css` |
| All server mutations | `src/app/actions.ts` |
| Database schema | `src/db/schema.ts` |
| Database client | `src/db/index.ts` |
| Clerk middleware | `src/proxy.ts` |
| Main map (client) | `src/components/map/MainMap.tsx` |
| Bulgaria GeoJSON | `src/data/bulgaria.ts` |
| UI components | `src/components/ui/*.tsx` |
| Seed script | `scripts/seed.ts` |
| Env vars | `.env.local` |
| Drizzle config | `drizzle.config.ts` |

---

## Naming Conventions

- **Pages:** `page.tsx` (Next.js convention) — PascalCase component export named descriptively
- **Components:** PascalCase filenames (`MainMap.tsx`, `ReviewForm.tsx`)
- **UI Library:** kebab-case filenames (`alert-dialog.tsx`, `input-otp.tsx`) — shadcn convention
- **Hooks:** `use-kebab-case.jsx` (legacy uses .jsx, hooks folder only has .jsx)
- **DB:** camelCase schema fields, snake_case column names in DB
- **Actions:** camelCase function names in `actions.ts` (`addSpot`, `addReview`)

---

## Duplicate Routes

`src/app/page.tsx` and `src/app/map/page.tsx` are **identical** — both render `MainMap` with spots fetched the same way. This is tech debt from the migration.
