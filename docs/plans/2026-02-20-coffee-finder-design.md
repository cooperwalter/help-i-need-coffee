# Help, I Need Coffee — Design Document

## Problem

A caffeine addict experiencing withdrawal needs to find the nearest coffee shop immediately. Existing solutions (Google Maps, Yelp) require multiple taps, comparison shopping, and decision-making — all impossible when your brain is foggy from caffeine withdrawal.

## Solution

A single-purpose web app that does one thing: finds the nearest coffee shop by driving time and gets you navigating there in two taps.

## Target User

A coffee addict in caffeine withdrawal. Irritable, foggy, urgent. Needs speed and clarity, not options.

## Tech Stack

- Runtime/package manager: Bun
- Framework: TanStack Start (React, SSR, server functions)
- Styling: Tailwind CSS v4 with custom diner theme
- Linter/formatter: Biome
- Testing: bun test
- Type checking: TypeScript strict mode
- External API: Google Places API (Nearby Search, Autocomplete, Directions)

## Aesthetic: "Diner Counter"

Warm retro diner vibes. Nostalgic, cozy, hand-crafted.

- Typography: Fraunces (display, italic) + Nunito (body, humanist sans)
- Colors: warm cream (#FFF6EC), espresso brown (#2C1810), burnt orange (#C8590A), warm amber
- Textures: subtle paper grain overlay, coffee-stained warmth
- Animation: steaming coffee cup that jiggles, smooth card transitions
- Microcopy: playful diner-style ("hang in there, pal")

Reference mockup: `mockup-a-diner-counter.html`

## Architecture

Single-page app, one route (`/`). No database, no auth, no user accounts.

Three TanStack Start server functions proxy Google API calls:
1. `searchNearbyShops` — Nearby Search for coffee shops, returns closest by drive time
2. `getPlaceAutocomplete` — address autocomplete suggestions
3. `getDirections` — driving time calculation

API key stays server-side. All Google calls go through server functions.

## UX Flow

Three states on a single screen:

1. **Input**: location share button + address autocomplete input
2. **Loading**: encouraging rotating microcopy, intensified coffee cup animation
3. **Result**: shop name, drive time, open/closed + hours, big TAKE ME THERE button

Navigation handoff: auto-detect platform (iOS -> Apple Maps, Android -> Google Maps). "Use different app" fallback for Waze/other.

## Testing

Unit tests via bun test targeting near-complete coverage:
- Server functions: mock Google API, test sorting, error handling, key protection
- Client utilities: platform detection, maps URL building, formatting
- Components: React Testing Library for all states, transitions, interactions

TypeScript strict mode, no `any`, all API responses typed.
