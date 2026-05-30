---
name: API-Zod Codegen Conflict Fix
description: Why lib/api-zod/src/index.ts must only re-export from generated/api
---

## The Problem
Orval generates two outputs: `generated/api.ts` (Zod schemas) and `generated/types/` (TypeScript interfaces). Both export the same names (e.g. `UpdatePropertyStatusBody`). Re-exporting both causes TS2308 ambiguity errors.

## The Fix
`lib/api-zod/src/index.ts` must contain ONLY:
```ts
export * from "./generated/api";
```
Do NOT export from `./generated/types` — the Zod inferred types are sufficient.

**Why:** Codegen runs `pnpm -w run typecheck:libs` after generation. The duplicate export breaks typecheck even though the orval generation itself succeeds. Since Zod schemas already contain inferred TypeScript types, the types/ folder is redundant.

**How to apply:** After every `pnpm --filter @workspace/api-spec run codegen` run, verify `lib/api-zod/src/index.ts` wasn't overwritten with both exports. If it was, remove the `./generated/types` export line.
