# LuxeState CRM

A luxury real estate CRM with a marketing landing page and a full dashboard for managing leads, properties, analytics, and settings.

## Run & Operate

- `pnpm --filter @workspace/luxestate run dev` — run the frontend (port 21665, previewPath `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7 + Tailwind CSS v4
- Routing: Wouter (replaces Next.js `next/link` and `usePathname`/`useRouter`)
- Theming: next-themes (works in Vite; wraps `ThemeProvider` in `src/components/theme-provider.tsx`)
- Charts: Recharts
- Animation: Framer Motion
- UI: Radix UI + shadcn/ui components (`src/components/ui/`)

## Where things live

- `artifacts/luxestate/` — main React + Vite web app
- `artifacts/luxestate/src/index.css` — luxury theme (oklch colors, glassmorphism, CSS vars)
- `artifacts/luxestate/src/lib/ui-classes.ts` — shared Tailwind class strings for inputs/selects/buttons
- `artifacts/luxestate/src/components/dashboard/` — all dashboard components
- `artifacts/luxestate/src/components/marketing/` — all marketing page components
- `artifacts/luxestate/src/pages/dashboard/` — dashboard page components + DashboardLayout
- `artifacts/luxestate/src/pages/marketing.tsx` — marketing landing page

## Architecture decisions

- Pure frontend app — no backend or database (ported from Next.js v0 project)
- `next/link` → wouter `<Link>`, `usePathname` → `useLocation`, no `useRouter` needed
- Sidebar active state detection uses exact match for `/dashboard`, prefix match for nested routes
- Lead data lives in `leads-data.ts` (static seed) + `leads-types.ts` (TypeScript types) — state is lifted into the LeadsPage component
- `Empty` component from original was removed; replaced with inline empty-state div to avoid importing non-existent UI components

## Product

- Marketing landing page: hero, features, dashboard preview, testimonials, pricing, footer
- Dashboard: overview (stats, chart, quick actions, property carousel), leads pipeline with WhatsApp integration, property listings with gallery, analytics charts, settings with profile/theme/notifications/WhatsApp

## Gotchas

- `next-themes` requires `attribute="class"` on `ThemeProvider` to apply `.dark` class used by Tailwind v4 CSS vars
- Wouter `<Link>` renders an `<a>` directly — wrap in a `<div>` if you need a block-level container
- `surfaceSelectClass` applies border + bg but NOT height — apply `h-8` or `h-9` manually at the call site when needed
