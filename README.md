# Help, I Need Coffee

A single-purpose web app that finds the nearest coffee shop by driving time and launches turn-by-turn navigation to it. Enter your location, get one result, tap "TAKE ME THERE."

No browsing. No comparison shopping. Just the fastest caffeine.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| Framework | [TanStack Start](https://tanstack.com/start) (SSR) |
| UI | [React 19](https://react.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Build | [Vite 7](https://vite.dev) |
| Linter/Formatter | [Biome](https://biomejs.dev) |
| Testing | Bun test + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) |
| External API | [Google Maps Platform](https://developers.google.com/maps) (Places, Directions) |

## Prerequisites

- [Bun](https://bun.sh) (v1.x+)
- A Google Cloud project with the following APIs enabled:
  - Places API
  - Directions API

## Setup

```bash
# Clone the repo
git clone <repo-url>
cd help-i-need-coffee

# Install dependencies
bun install

# Copy the example env file and add your API key
cp .env.example .env
# Edit .env and set GOOGLE_PLACES_API_KEY

# Start the dev server
bun run dev
```

The app will be available at `http://localhost:3000`.

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start the Vite dev server |
| `bun run build` | Production build |
| `bun test` | Run all tests |
| `bun run typecheck` | TypeScript type-check (no emit) |
| `bun run lint` | Lint and format check with Biome |
| `bun run lint:fix` | Auto-fix lint and formatting issues |

## How It Works

1. **Get location** — via browser geolocation or address autocomplete (Google Places Autocomplete)
2. **Search** — queries Google Places Nearby Search for coffee shops, expanding from 5km to 10km to 20km until results are found
3. **Rank** — takes the top 5 candidates by distance and queries Google Directions API for driving time to each
4. **Result** — displays the single fastest-to-reach shop with name, drive time, and open/closed status
5. **Navigate** — platform-aware deep link opens your preferred maps app (Apple Maps on iOS, Google Maps on Android, Google Maps web on desktop), with alternatives for Waze and others

All Google API calls are proxied through TanStack Start server functions so the API key never reaches the client.

## Project Structure

```
src/
├── routes/              # TanStack Router file-based routes
│   ├── __root.tsx       # Root layout (fonts, meta tags)
│   └── index.tsx        # Home page (all app states)
├── components/          # React components
│   ├── CoffeeCup.tsx    # Animated SVG coffee cup
│   ├── LocationInput.tsx # GPS + address autocomplete input
│   └── ResultCard.tsx   # Result display + navigation links
├── server/              # Server functions (Google API proxies)
│   ├── search-nearby-shops.ts
│   ├── get-place-autocomplete.ts
│   └── get-directions.ts
├── lib/                 # Utilities
│   ├── types.ts         # Shared TypeScript types
│   ├── google-api.ts    # Fetch wrapper with retry + API key management
│   ├── format.ts        # Drive time and status formatting
│   ├── maps-url.ts      # Maps app deep link builders
│   └── platform.ts      # iOS / Android / desktop detection
├── styles.css           # Tailwind theme + animations
├── client.tsx           # Client entry point
└── router.tsx           # Router configuration
```

## Design

The visual aesthetic is "Diner Counter" — warm cream and espresso tones, a [Fraunces](https://fonts.google.com/specimen/Fraunces) display font, [Nunito](https://fonts.google.com/specimen/Nunito) body font, and subtle film-grain texture. The layout is mobile-first, single-column, max-width 440px.

## macOS Build Fix

If `bun run build` fails with `EPIPE` on macOS Sequoia:

```bash
codesign --force --deep --sign - node_modules/@esbuild/darwin-arm64/bin/esbuild
```
