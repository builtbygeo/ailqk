# TESTING.md — Test Structure & Quality Practices

## Test Framework

**None configured.**

There is no test framework, no test files, and no test scripts in this project.

| Check | Status |
|---|---|
| Test runner (Jest/Vitest/Playwright) | ❌ Not installed |
| Test files (`*.test.ts`, `*.spec.ts`) | ❌ None found |
| `test` script in `package.json` | ❌ Missing |
| CI pipeline with tests | ❌ No CI config (no `.github/`, no GitHub Actions) |
| Coverage reporting | ❌ None |
| E2E tests | ❌ None |
| Snapshot tests | ❌ None |

---

## Manual Verification Methods (Current Practice)

### 1. Debug Logging
The profile page (`src/app/profile/page.tsx`) has extensive `console.log('DEBUG: ...')` statements left in — indicating manual browser console verification during development:

```ts
console.log('DEBUG: ProfilePage rendering started');
console.log('DEBUG: currentUser() result:', ...);
console.log('DEBUG: userSpotsCount fetched');
console.log('DEBUG: userReviewsCount fetched');
```

### 2. Seed Data
`scripts/seed.ts` provides a seeding mechanism for populating the local SQLite database with 50 Bulgarian outdoor spots. This serves as a manual integration test for the DB schema.

### 3. GSD Planning Phase Verification
Each `.planning/phases/` plan file includes explicit `verify` commands:
```bash
# Phase 03 verification examples:
grep "@base44" package.json  # Should be empty
ls src/api/base44client.js   # Should fail
grep -r "@base44" src/ | wc -l  # Should be 0

# Phase 04 verification examples:
ls public/marker-icon.png && grep mergeOptions src/main.jsx
grep geolocation src/pages/AddLocation.jsx
grep "\\"moment\\"" package.json  # Should return nothing
```

---

## Type Safety as a Quality Layer

TypeScript strict mode provides a degree of compile-time verification:
- Drizzle schema types flow into queries automatically
- Server Component async/await patterns are type-checked
- shadcn components have full type signatures

However, the `as any` usage in multiple places breaks this safety net.

---

## What to Add Next

If adding tests, recommended approach:

### Unit Tests (Vitest — recommended for Next.js 16)
```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
```
Priority targets:
- `src/app/actions.ts` — `addSpot()` and `addReview()` pure logic
- `src/data/bulgaria.ts` — GeoJSON structure validation
- Rating aggregate calculation in `addReview`

### Integration Tests
- DB operations with a test SQLite file
- Server Actions called with mock `db`

### E2E Tests (Playwright)
```bash
npx playwright install
```
Priority flows:
- Map loads with spots visible
- Click spot → popup → navigate to details
- Add spot form submission
- Leave review flow

---

## Quality Gaps Summary

| Area | Gap |
|---|---|
| Unit tests | Zero coverage |
| Integration tests | None |
| E2E tests | None |
| CI | No pipeline |
| Type safety | `as any` in 4+ places |
| Input validation | No Zod validation on Server Actions |
| Auth coverage | No tests for auth-gated paths |
| Error boundary coverage | Only profile page has catch |
