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
- Tailwind CSS v4 uses `@import "tailwindcss"` in CSS, configured via `@tailwindcss/vite` plugin; custom colors/fonts via `@theme` block
- Biome v2.4.4 CSS parser: enable `tailwindDirectives: true` in `css.parser` config to support `@theme`, `@apply`, etc.
- Biome a11y rule `noNoninteractiveElementToInteractiveRole`: use `<div>` not `<ul>`/`<li>` when applying `role="listbox"`/`role="option"`
- TanStack Start `createServerFn` API (v1.161.3): uses `.inputValidator()` (not `.validator()`), called with `{ data: ... }` on client side
- Component tests use jsdom (not happy-dom) via `test-setup.ts` preloaded in `bunfig.toml` — happy-dom v20 has broken `querySelectorAll` with `@testing-library/react`
- Module mocking in bun: `mock.module()` hoists before imports; define mock functions before `mock.module()` call for proper reference
- TanStack Router test files in `src/routes/` need `tsr.config.json` with `routeFileIgnorePattern` to avoid route-tree warnings
- macOS Sequoia (Darwin 25) may add `com.apple.provenance` to esbuild binary, causing SIGKILL — fix with `codesign --force --deep --sign -`
- `getDirections` catch block must differentiate timeout errors (Error "Request timed out" / DOMException AbortError) from other errors — blanket catch swallows unexpected errors as TIMEOUT
- Tailwind v4 opacity modifiers work with custom theme colors: `bg-espresso/[0.06]` = `rgba(44,24,16,0.06)`; shadow arbitrary values keep inline rgba since CSS variables can't interpolate in Tailwind shadow syntax

---

## Phases 1–9: Core Implementation, Tests & Bug Fixes — COMPLETE

All core phases (scaffolding, types, utilities, server functions, UI components, visual design, integration, component & integration tests, bug fixes) are complete. See git history for details.

## Phase 10: Tailwind Theme Extensions — COMPLETE

Per the visual design spec ("Implemented as Tailwind CSS theme extensions"), replaced hardcoded color and font arbitrary values with semantic theme tokens.

- [x] Add `@theme` block to `styles.css` with 9 color tokens (cream, cream-light, espresso, espresso-light, mocha, burnt-orange, amber-warm, status-green, status-red) and 2 font tokens (display, body)
- [x] Enable `tailwindDirectives: true` in Biome CSS parser config for `@theme` support
- [x] Replace all hardcoded hex/rgba color values with semantic theme names across index.tsx, LocationInput.tsx, ResultCard.tsx (e.g., `bg-[#FFF6EC]` → `bg-cream`, `text-[#2C1810]` → `text-espresso`)
- [x] Replace `font-['Fraunces']` / `font-['Nunito']` with `font-display` / `font-body`
- [x] Fix max-width from 480px to 440px per visual design spec
- [x] SVG inline attributes and complex shadow arbitrary values retain hex/rgba (CSS variables cannot interpolate in those contexts)

**Total: 68 tests passing across 10 files. All typecheck, lint, and build pass.**

## Phase 11: Spec Compliance Gaps — COMPLETE

Gap analysis against all specs identified three items. Two implemented, one documented as design decision.

- [x] Export `getDirections` as a `createServerFn` server function (`getDirectionsFn`) — spec defines it as a first-class server function alongside `searchNearbyShops` and `getPlaceAutocomplete`
- [x] Add `buildGoogleMapsIOSAppUrl` using `comgooglemaps://` URL scheme — spec's navigation-handoff requires iOS fallback for Google Maps app; ResultCard now uses `comgooglemaps://` on iOS and web URL on other platforms for the "use a different app" Google Maps link
- [x] Location bias for autocomplete — Google Places Autocomplete API biases by requester IP automatically; since requests proxy through the server function, the server's IP is used instead of the client's; the server function already accepts `locationBias` for future explicit coordinate passing; acceptable for MVP per spec's "when available" qualifier

**Total: 69 tests passing across 10 files. All typecheck, lint, and build pass.**
