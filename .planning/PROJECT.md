# Ailyak (Айляк)

## What This Is

Ailyak is a Bulgaria-focused outdoor discovery platform for vanlife, overlanding, and wild camping. It helps users find safe, legal, and beautiful spots while encouraging responsible nature preservation.

## Core Value

Connect the Bulgarian outdoor community with high-quality, verified camping spots while ensuring compliance with nature protection regulations.

## Requirements

### Validated

- ✓ [AUTH] Clerk-based authentication system
- ✓ [MAP] Interactive Leaflet map with spot markers
- ✓ [DB] SQLite (Drizzle) database for spots and reviews
- ✓ [CORE] Spot submission and detail viewing
- ✓ [CLEANUP] Single JOIN queries for performance (no N+1)
- ✓ [CLEANUP] Complete removal of legacy Vite/Base44 code

### Active

- [ ] [ADMIN] Functional Admin Panel for approving/rejecting user spots
- [ ] [PRO] Subscription system (gating "host" listings for Pro users)
- [ ] [PROFILE] Fully dynamic user profiles with stats and spot history
- [ ] [UX] Unified map experience between root and /map
- [ ] [PRODUCTION] Production environment config (Turso DB, Clerk production keys)

### Out of Scope

- [BOOKING] Real-time booking system — [deferred to later MVP]
- [SOCIAL] Friends lists and direct messaging — [non-core for now]

## Context

The project recently underwent a major architecture cleanup to remove legacy code from a previous Vite-based version. It now uses a modern Next.js 16 App Router stack.

## Constraints

- **Tech Stack**: Next.js 16, React 19, Tailwind v4, Drizzle ORM, Clerk Auth.
- **Database**: Local SQLite for development; Turso (libSQL) planned for production.
- **Geography**: Exclusively focused on Bulgarian territories.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 16 | SSR performance and better SEO for spot discovery. | ✓ Good |
| Clerk Auth | Handles user security and metadata (Pro status) out of the box. | ✓ Good |
| Drizzle ORM | Type-safe DB interactions and performance control. | ✓ Good |
| Admin Logic | Manual approval required to prevent illegal spot listings. | — Pending |

---
*Last updated: 2026-04-10 after initial cleanup and feature addition*
