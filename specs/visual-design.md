# Visual Design

The app uses a "Diner Counter" aesthetic: warm, retro, nostalgic, and hand-crafted. The reference implementation is `mockup-a-diner-counter.html`.

## Typography

Display font: Fraunces (variable, Google Fonts) — used for the title and shop name. Italic weight for the main heading, bold for the shop name on the result card.

Body font: Nunito (Google Fonts) — used for all body text, labels, buttons, and UI elements. Soft and humanist.

Both fonts are loaded via Google Fonts with `font-display: swap`.

## Color Palette

Implemented as Tailwind CSS theme extensions:

- `cream`: #FFF6EC (page background)
- `cream-light`: #FFFAF4 (card backgrounds)
- `espresso`: #2C1810 (primary text)
- `espresso-light`: #3D2B1F (secondary text)
- `mocha`: #5C4033 (muted text)
- `burnt-orange`: #C8590A (accent, interactive elements, highlights)
- `amber-warm`: #D4860A (hover states, secondary accent)
- `status-green`: #4A7A3D (open indicator)
- `status-red`: #A0413A (closed indicator)

## Texture and Effects

The page background has a subtle paper grain texture applied via an SVG noise filter at low opacity. Cards use soft shadows and thin borders with rounded corners. A faint warm radial gradient adds depth to the background.

## Animation

A steaming coffee cup SVG sits at the top of the page. Three steam wisps rise and fade in a staggered loop. During loading state, the cup jiggles faster to convey urgency. The result card slides up with a gentle easing animation. Interactive elements have spring-like hover transitions.

## Microcopy

All copy is lowercase, friendly, and diner-themed:
- Loading: "hang in there, pal...", "brewing up results...", "almost there..."
- Result: "found one close by" / "nearest spot"
- Error (no results): "no coffee nearby? that's a crisis."
- Error (geolocation denied): "no worries, just type your address"
- Error (API): "something went wrong. give it another shot."
- Footer: "made with warmth and mild desperation"

## Responsive Behavior

Mobile-first layout centered at max-width 440px. Padding and font sizes scale up at 520px and 768px breakpoints. The layout is a single column at all sizes.
