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

## Phase 4: Server Functions (`src/server/`)

### 4a. Google API Wrapper (`src/lib/google-api.ts`)
- [ ] Implement reusable `fetchWithRetry` wrapper: retry once on 429/500/503, 10s timeout per call
- [ ] Ensure the Google API key (`process.env.GOOGLE_PLACES_API_KEY`) is never included in responses
- [ ] Write tests for retry logic, timeout, and key sanitization

### 4b. `searchNearbyShops` Server Function
- [ ] Create TanStack Start server function with `createServerFn`
- [ ] Accept `{ lat: number; lng: number }` input
- [ ] Query Google Places Nearby Search (type: `cafe`, keyword: `coffee`, starting radius: 5km)
- [ ] Expand radius to 10km, then 20km if no results found
- [ ] Take top 5 results by straight-line distance, query Directions API for driving time to each
- [ ] Return the shop with shortest driving time as `CoffeeShopResult`
- [ ] Return typed error responses (`NO_RESULTS`, `API_ERROR`, `TIMEOUT`) — errors returned as objects, never thrown
- [ ] Write tests:
  - [ ] should return the nearest coffee shop by driving time when multiple shops are found
  - [ ] should expand search radius from 5km to 10km when no shops found at 5km
  - [ ] should expand search radius from 10km to 20km when no shops found at 10km
  - [ ] should return empty result with status when no shops found at any radius
  - [ ] should include open/closed status and today's hours in the response
  - [ ] should handle Google Nearby Search API errors with a typed error response
  - [ ] should handle Google Directions API errors with a typed error response
  - [ ] should retry once on 429/500/503 errors from Google API
  - [ ] should timeout after 10 seconds per Google API call
  - [ ] should never include the Google API key in the response

### 4c. `getPlaceAutocomplete` Server Function
- [ ] Create TanStack Start server function with `createServerFn`
- [ ] Accept `{ query: string; locationBias?: Coordinates }` input
- [ ] Validate non-empty input string
- [ ] Query Google Places Autocomplete, return up to 5 suggestions with coordinates
- [ ] Bias results toward user's region using `locationBias` when provided
- [ ] Return typed error responses (`API_ERROR`, `INVALID_INPUT`) — errors returned as objects, never thrown
- [ ] Write tests:
  - [ ] should return up to 5 formatted address suggestions
  - [ ] should return empty array for queries with no matches
  - [ ] should handle Google Autocomplete API errors with a typed error response
  - [ ] should validate that the input string is non-empty

### 4d. `getDirections` Server Function
- [ ] Create TanStack Start server function with `createServerFn`
- [ ] Accept `{ origin: Coordinates; destination: Coordinates }` input
- [ ] Query Google Directions API for driving time
- [ ] Return `{ driveTimeMinutes, distanceMeters }` or typed error (`NO_ROUTE`, `API_ERROR`, `TIMEOUT`) — errors returned as objects, never thrown
- [ ] Write tests:
  - [ ] should return driving time in minutes between two coordinates
  - [ ] should handle Google Directions API errors with a typed error response
  - [ ] should handle no-route-found responses

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
