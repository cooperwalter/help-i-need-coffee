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

---

## Phase 1: Project Scaffolding — COMPLETE

- [x] Initialize Bun project (`bun init`) with `package.json`
- [x] Install TanStack Start, React, React DOM, and related dependencies
- [x] Install Tailwind CSS v4 and configure with Vite plugin
- [x] Install and configure Biome (linter/formatter) — `biome.json` enforcing no `any`, strict mode rules
- [x] Configure TypeScript `tsconfig.json` with strict mode enabled
- [x] Set up TanStack Start app entry point (`src/router.tsx`, `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/client.tsx`, `vite.config.ts`)
- [x] Create `src/lib/`, `src/components/`, `src/server/` directories
- [x] Create `.env.example` with `GOOGLE_PLACES_API_KEY` placeholder
- [x] Verify `bun run dev` serves a blank page successfully

## Phase 2: TypeScript Types (`src/lib/types.ts`) — COMPLETE

- [x] Define `Coordinates`, `CoffeeShopResult`, `SearchErrorResponse`, `AutocompleteSuggestion`, `AutocompleteResponse`, `AutocompleteErrorResponse`, `DirectionsResult`, `DirectionsErrorResponse`, `AppState`, `Platform` types
- [x] Verify types compile: `bunx tsc --noEmit`

## Phase 3: Shared Utilities (`src/lib/`) — COMPLETE

### 3a. Platform Detection (`src/lib/platform.ts`) — COMPLETE
- [x] Implement `detectPlatform(userAgent: string): Platform`
- [x] 3 tests passing

### 3b. Maps URL Builder (`src/lib/maps-url.ts`) — COMPLETE
- [x] Implement `buildMapsUrl`, `buildAppleMapsUrl`, `buildGoogleMapsAppUrl`, `buildGoogleMapsWebUrl`, `buildWazeUrl`
- [x] 7 tests passing

### 3c. Formatting Utilities (`src/lib/format.ts`) — COMPLETE
- [x] Implement `formatDriveTime`, `formatOpenStatus`
- [x] 9 tests passing

---

## Phase 4: Server Functions (`src/server/`) — COMPLETE

### 4a. Google API Wrapper (`src/lib/google-api.ts`) — COMPLETE
- [x] `fetchWithRetry` with configurable timeout (default 10s), retry on 429/500/503
- [x] `getApiKey()` and `sanitizeResponse()` to protect API key
- [x] 12 tests passing

### 4b. `searchNearbyShops` Server Function — COMPLETE
- [x] Queries Google Places Nearby Search, expands radius 5km → 10km → 20km
- [x] Gets driving time via Directions API for top 5 results, returns shortest
- [x] Parses opening hours into 12-hour format, returns typed errors
- [x] 10 tests passing

### 4c. `getPlaceAutocomplete` Server Function — COMPLETE
- [x] Queries Google Places Autocomplete with location bias, resolves coordinates via Place Details
- [x] Input validation, typed error responses
- [x] 4 tests passing

### 4d. `getDirections` Server Function — COMPLETE
- [x] Queries Google Directions API, returns drive time and distance
- [x] Typed error responses for NO_ROUTE, API_ERROR, TIMEOUT
- [x] 3 tests passing

**Note:** Server functions are implemented as plain async functions. They will be wrapped with `createServerFn` when wiring up the route in Phase 5/7. This separation keeps the business logic testable without framework coupling.

## Phase 5: UI Components

### 5a. App Shell & State Management (`src/routes/index.tsx`)
- [ ] Implement single-route app with `AppState` discriminated union state
- [ ] Wire state transitions: input -> loading -> result / error-no-results / error-api, error -> input (reset)
- [ ] Geolocation denied is handled as inline error within input state, not a state transition
- [ ] Render playful tagline in input state (diner-themed, lowercase)
- [ ] Write tests for state transitions

### 5b. LocationInput Component (`src/components/LocationInput.tsx`)
- [ ] Render geolocation button ("use my current location") — prominent, primary action
- [ ] Implement `navigator.geolocation.getCurrentPosition` with `enableHighAccuracy: false`, 8s timeout
- [ ] Handle geolocation denial/timeout: inline error message
- [ ] Render address text input with autocomplete dropdown
- [ ] Debounce autocomplete requests by 300ms
- [ ] Keyboard navigation (arrow keys + enter), close on outside click or Escape
- [ ] Clear/reset affordance when text is present
- [ ] Write tests

### 5c. ResultCard Component (`src/components/ResultCard.tsx`)
- [ ] Display shop name, driving time badge, open/closed status with pulsing dot, today's hours
- [ ] "TAKE ME THERE" button using `buildMapsUrl`
- [ ] "use a different app" link revealing Apple Maps / Google Maps / Waze options
- [ ] "search again" link resetting to input state
- [ ] Write tests

### 5d. Error States
- [ ] No Results: "no coffee nearby? that's a crisis." + "try again"
- [ ] API/Network Failure: "something went wrong. give it another shot." + "try again"
- [ ] Geolocation Denied: inline message, address input stays active

## Phase 6: Visual Design (Diner Counter Theme)

### 6a. Tailwind Theme Configuration
- [ ] Extend Tailwind theme with custom colors and font families
- [ ] Google Fonts `<link>` tags already added in `__root.tsx`

### 6b. Page Layout & Textures
- [ ] Single-column centered layout (max-width: 440px)
- [ ] Paper grain SVG noise filter, warm radial gradient background
- [ ] Responsive breakpoints at 520px and 768px

### 6c. Coffee Cup Animation (`src/components/CoffeeCup.tsx`)
- [ ] Port SVG coffee cup from mockup
- [ ] Steam wisps, wobble animation, jiggle animation for loading

### 6d. UI Polish
- [ ] Card styles, gradient accent strips, diner divider
- [ ] Result card slide-up animation, spring hover transitions
- [ ] Pulsing open status dot, loading microcopy rotation
- [ ] Footer with coffee ring SVG

## Phase 7: Integration & Final Verification

- [ ] Wire LocationInput -> searchNearbyShops -> ResultCard full flow
- [ ] Verify all state transitions end-to-end
- [ ] Run full test suite, type check, lint — all pass
- [ ] Verify `bun run build` succeeds
