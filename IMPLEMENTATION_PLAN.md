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

---

## Phase 1–7: Core Implementation — COMPLETE

All core phases (scaffolding, types, utilities, server functions, UI components, visual design, integration) are complete. See git history for details.

## Phase 8: Component & Integration Tests — COMPLETE

### 8a. Test Infrastructure — COMPLETE
- [x] Install jsdom and @types/jsdom for DOM testing
- [x] Create `test-setup.ts` with jsdom global registration
- [x] Configure `bunfig.toml` with `preload = ["./test-setup.ts"]`
- [x] Configure `tsr.config.json` with `routeFileIgnorePattern` to ignore test files in routes

### 8b. ResultCard Component Tests (`src/components/ResultCard.test.tsx`) — COMPLETE
- [x] should display the coffee shop name, drive time, and open status
- [x] should display today's closing time when the shop is open
- [x] should display today's opening time when the shop is closed
- [x] should render the TAKE ME THERE button with the correct maps URL
- [x] should show the "use a different app" options when the link is clicked
- [x] should render the try-again link that resets to input state
- [x] 6 tests passing

### 8c. LocationInput Component Tests (`src/components/LocationInput.test.tsx`) — COMPLETE
- [x] should render the geolocation button and address input
- [x] should call the geolocation API when the location button is clicked
- [x] should display autocomplete suggestions when the user types an address
- [x] should select a suggestion and trigger search when a suggestion is clicked
- [x] should show an error message when geolocation is denied
- [x] should show an error message when geolocation times out
- [x] should debounce autocomplete requests by 300ms
- [x] 7 tests passing

### 8d. App State Transition Tests (`src/routes/index.test.tsx`) — COMPLETE
- [x] should start in the input state
- [x] should transition to loading state when a location is provided
- [x] should transition to result state when a shop is found
- [x] should transition to error state on API failure
- [x] should reset to input state when try-again is clicked
- [x] 5 tests passing

**Total: 66 tests passing across 10 files. All typecheck, lint, and build pass.**
