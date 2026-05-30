---
name: LuxeState Next.js → Vite/Wouter migration
description: Porting rules used when migrating a Next.js v0 project to the pnpm_workspace React+Vite stack
---

## Key substitutions

- `next/link` → `import { Link } from "wouter"` (renders `<a>` directly)
- `usePathname()` → `const [location] = useLocation()` from wouter
- `useRouter()` → not needed; use wouter `useLocation` or `<Link>` instead
- Nav anchor `href="#section"` → keep as plain `<a href="#section">`, not wouter `<Link>` (hash links stay as-is)

## next-themes in Vite

Works without change. Just wrap in `ThemeProvider attribute="class" defaultTheme="light" enableSystem`.
The `attribute="class"` is required so `.dark` is applied and Tailwind v4 CSS vars activate correctly.

## Empty state components

Original used a custom `<Empty>` component from `@/components/ui/empty` that the scaffold doesn't include.
**Why:** Scaffold doesn't ship every possible shadcn component.
**How to apply:** Replace `<Empty>` with a plain `<div>` containing the empty-state content inline.

## surfaceSelectClass

Defined in `src/lib/ui-classes.ts`. Applies border + bg but NOT height. Add `h-8` or `h-9` at the call site.
