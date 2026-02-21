# Implementation Plan — Help, I Need Coffee

Greenfield build. All items below are ordered by dependency and priority.

## Status Legend
- [ ] Not started
- [x] Complete

## Learnings

- TanStack Start (current version) uses `vite.config.ts` with `tanstackStart()` plugin, NOT `app.config.ts`
- File structure: `src/router.tsx`, `src/client.tsx`, `src/routes/__root.tsx`, `src/routes/index.tsx`
- Route tree is auto-generated at `src/routeTree.gen.ts` — must be excluded from Biome checks
- Biome v2.4.4 config: uses `assist` instead of `organizeImports`, `includes` instead of `ignore` for files, needs overrides for gen files
- Tailwind CSS v4 uses `@import "tailwindcss"` in CSS, configured via `@tailwindcss/vite` plugin
- Biome a11y rule `noNoninteractiveElementToInteractiveRole`: use `<div>` not `<ul>`/`<li>` when applying `role="listbox"`/`role="option"`
- TanStack Start `createServerFn` API (v1.161.3): uses `.inputValidator()` (not `.validator()`), called with `{ data: ... }` on client side
- Component tests use jsdom (not happy-dom) via `test-setup.ts` preloaded in `bunfig.toml` — happy-dom v20 has broken `querySelectorAll` with `@testing-library/react`
- Module mocking in bun: `mock.module()` hoists before imports; define mock functions before `mock.module()` call for proper reference
- TanStack Router test files in `src/routes/` need `tsr.config.json` with `routeFileIgnorePattern` to avoid route-tree warnings
- macOS Sequoia (Darwin 25) may add `com.apple.provenance` to esbuild binary, causing SIGKILL — fix with `codesign --force --deep --sign -`
- `getDirections` catch block must differentiate timeout errors (Error "Request timed out" / DOMException AbortError) from other errors — blanket catch swallows unexpected errors as TIMEOUT

---

## Phases 1–8: Core Implementation & Tests — COMPLETE

All core phases (scaffolding, types, utilities, server functions, UI components, visual design, integration, component & integration tests) are complete. See git history for details.

## Phase 9: Bug Fixes — COMPLETE

- [x] Fix `getDirections` error handling — catch block incorrectly treated all errors as TIMEOUT instead of differentiating timeout from unexpected errors (matching `searchNearbyShops` pattern)
- [x] Add `timeoutMs` option to `getDirections` for testability (consistent with `searchNearbyShops` API)
- [x] Add test: should return TIMEOUT error when the Google API request times out
- [x] Add test: should re-throw unexpected non-timeout errors instead of swallowing them

**Total: 68 tests passing across 10 files. All typecheck, lint, and build pass.**
