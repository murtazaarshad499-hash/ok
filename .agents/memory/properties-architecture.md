---
name: Properties System Architecture
description: How the full DB-backed Properties management system works in LuxeState CRM
---

## Data Flow
- DB schema: `lib/db/src/schema/properties.ts` — uses `metadata` JSONB for rich fields (owner, agent, analytics, priceHistory, featured, pool, notes, daysOnMarket).
- API route: `artifacts/api-server/src/routes/properties.ts` — REST CRUD, requireAuth middleware (named export).
- Frontend adapter: `artifacts/luxestate/src/lib/properties-api.ts` — `recordToProperty()` and `propertyToInput()` bridge the DB `PropertyRecord` to the frontend `Property` type.
- Page: `artifacts/luxestate/src/pages/dashboard/properties.tsx` — uses `useProperties`, `useCreateProperty`, `useUpdateProperty`, `useDeleteProperty`, `useUpdatePropertyStatus` hooks.

## Key Mapping Rules
- DB `type` ↔ frontend `category`
- DB `parkingSpaces` ↔ frontend `garage`  
- DB `amenities[]` ↔ frontend `features[]`
- DB `images[0]` ↔ frontend `image` (first image only displayed)
- DB `metadata.owner/agent/analytics/etc` ↔ frontend rich fields

**Why:** The frontend Property type is richer than the DB schema; metadata JSONB stores extras without schema migrations.
