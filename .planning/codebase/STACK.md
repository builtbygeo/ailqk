# STACK.md — Technology Stack

## Language & Runtime

| Layer | Technology | Version |
|---|---|---|
| Language | TypeScript | ^5.9.3 (strict mode) |
| Runtime | Node.js | (latest LTS via Next.js) |
| JSX | React | 19.2.3 |
| Framework | Next.js | 16.1.6 (App Router) |

**Note:** `tsconfig.json` has `"strict": true` with `"allowJs": true` — mixed JS/TS codebase due to legacy migration.

---

## Frontend Framework

- **Next.js 16 App Router** — Server Components by default, client components explicitly marked `"use client"`
- **React 19** — Latest stable
- **Tailwind CSS v4** — JIT compiler via `@tailwindcss/postcss`; configured in `src/app/globals.css` using `@import "tailwindcss"` and `@theme inline {}` block (Tailwind v4 syntax)

### UI Component Library

- **shadcn/ui** — All components live in `src/components/ui/` as TSX files (accordion, alert-dialog, avatar, badge, button, card, carousel, chart, checkbox, command, dialog, drawer, dropdown-menu, form, input, label, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toggle, tooltip — ~49 components)
- **Radix UI primitives** — Entire `@radix-ui/*` suite as peer deps for shadcn
- **class-variance-authority (CVA)** — Component variant management
- **clsx + tailwind-merge** — Conditional class utilities
- **lucide-react** — Icon library (`^0.577.0`)
- **next-themes** — Dark-mode support (imported but not fully wired)

### Mapping

- **Leaflet** `^1.9.4` + **react-leaflet** `^5.0.0` — Interactive map rendering
  - `src/data/bulgaria.ts` — Hand-crafted GeoJSON polygon for Bulgaria border + world mask
  - Marker icons manually copied to `public/` (marker-icon.png, marker-icon-2x.png, marker-shadow.png, layers.png)
- **@types/leaflet** `^1.9.21` — Type definitions

### Forms & Validation

- **react-hook-form** `^7.71.2`
- **@hookform/resolvers** `^5.2.2`
- **zod** `^4.3.6` — Schema validation

### Charting

- **recharts** `^3.8.0`

### Other

- **date-fns** `^4.1.0` — Date utilities
- **embla-carousel-react** `^8.6.0` — Carousel base for shadcn/carousel
- **cmdk** `^1.1.1` — Command palette
- **input-otp** `^1.4.2` — OTP input
- **react-day-picker** `^9.14.0` — Calendar
- **react-resizable-panels** `^4.7.2`
- **sonner** `^2.0.7` — Toast notifications
- **vaul** `^1.1.2` — Drawer component

---

## Backend (Next.js Server)

- **Next.js Server Components + Server Actions** — All DB operations are in `src/app/actions.ts` (tagged `"use server"`)
- **Server Actions** used for: `addSpot()`, `addReview()` — form submissions via `revalidatePath`

---

## Database

- **Drizzle ORM** `^0.45.1` — Type-safe ORM with SQLite support
- **@libsql/client** `^0.17.0` — Turso-compatible SQLite client
- **drizzle-kit** `^0.31.9` — Migrations CLI

### Configuration (`drizzle.config.ts`)
```ts
dialect: 'sqlite'
schema: './src/db/schema.ts'
out: './drizzle'
url: process.env.DATABASE_URL || 'file:./local.db'
```

### Local DB
- `local.db` — SQLite file in project root (dev)
- `DATABASE_URL` env var controls production URL (Turso-compatible)

---

## Authentication

- **Clerk** `@clerk/nextjs ^7.0.4`
  - `ClerkProvider` wraps layout in `src/app/layout.tsx`
  - Middleware in `src/proxy.ts` using `clerkMiddleware()`
  - `currentUser()` from `@clerk/nextjs/server` used in Server Components
  - `useAuth()` + `UserButton` used in client components (`src/components/UserNav.tsx`)
  - Keyless setup: `.clerk/.tmp/keyless.json` exists — dev convenience

---

## Typography

- **Outfit** font — loaded via `next/font/google` in layout root; CSS variable `--font-outfit`

---

## Build & Tooling

| Tool | Config File |
|---|---|
| TypeScript | `tsconfig.json` |
| ESLint | `eslint.config.mjs` (Next.js core-web-vitals + TS rules) |
| PostCSS | `postcss.config.mjs` |
| Drizzle | `drizzle.config.ts` |

### Scripts (`package.json`)
```json
"dev": "next dev"
"build": "next build"
"start": "next start"
"lint": "eslint"
```

---

## Environment Variables

Defined in `.env.local`:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (client-safe) |
| `CLERK_SECRET_KEY` | Clerk secret key (server-only) |
| `DATABASE_URL` | Turso/libsql connection URL (not present in local, falls back to `file:./local.db`) |
| `VITE_BASE44_APP_ID` | Legacy — leftover from Base44 era, unused by Next.js |
| `VITE_BASE44_APP_BASE_URL` | Legacy — leftover from Base44 era, unused by Next.js |

---

## Legacy Layer (Unused in Production)

The `src/legacy/` directory contains the original **Vite + React SPA** (Base44 platform) codebase:
- `src/legacy/main.jsx` — Vite SPA entry point
- `src/legacy/pages.config.js` — Auto-generated page routing from Base44
- `src/legacy/lib/AuthContext.jsx` — Mock auth stub (stubbed post-decoupling)
- `src/legacy/api/base44Client.js` — Full mock of the Base44 SDK (entities, reviews, locations, LLM integration)
- `src/api/base44Client.js` — Copy of mock client at non-legacy path

This layer is **not imported by the Next.js app** but remains in the repo for reference during migration.
