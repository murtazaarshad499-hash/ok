---
name: Leads System Status
description: Status and architecture of the full leads management system in LuxeState CRM
---

## What's Built
- DB: `leads` table via Drizzle ORM (all 10+ fields, jsonb for timeline/attachments/reminder)
- API: `artifacts/api-server/src/routes/leads.ts` — all routes protected with `requireAuth`
  - GET /leads, GET /leads/:id, POST /leads, PUT /leads/:id, PATCH /leads/:id, DELETE /leads/:id, POST /leads/bulk-delete
- Frontend hooks: `artifacts/luxestate/src/lib/leads-api.ts` — useLeads, useCreateLead, useUpdateLead, useDeleteLead, useBulkDeleteLeads, useBulkImportLeads
- Table UI: `leads-table.tsx` — search, 5-filter panel, pipeline status tabs, bulk select, CSV export, mobile card view
- Add modal: `add-lead-modal.tsx` — form with validation (name+email required)
- Detail modal: `lead-detail-modal.tsx` — inline edit, activity tab, files tab
- Profile page: `lead-profile.tsx` — full page view using real API data, edit overlay, delete confirm
- Seeded: 10 sample leads in DB

## Key Decisions
- `bulk-delete` route registered BEFORE `/:id` route to prevent route conflict
- `requireAuth` uses `getAuth(req)` from `@clerk/express` which reads Clerk session cookies automatically — frontend needs no explicit Authorization headers
- Profile page uses `useLeads()` to get all leads then finds by URL param id

**Why:** Clerk's express SDK handles cookie-based session auth transparently for same-origin browser requests.
