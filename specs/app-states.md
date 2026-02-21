# App States

The app is a single screen with three primary states and two error substates. All states render on the same page — there is no routing between pages.

## Input State

The initial state. The screen shows:
- Animated steaming coffee cup
- "help, i need coffee." title
- Geolocation button ("use my current location")
- Address text input with autocomplete
- Playful tagline

Transitions:
- User clicks geolocation button -> Loading state
- User selects an autocomplete suggestion -> Loading state

## Loading State

Triggered when the user provides a location. The screen shows:
- Coffee cup animation intensifies (faster jiggle)
- Rotating encouraging microcopy ("hang in there, pal...", "brewing up results...", "almost there...")
- Input section remains visible but visually dimmed

Transitions:
- Server function returns a result -> Result state
- Server function returns an error -> Error state
- No results found at any radius -> No Results error substate

## Result State

The screen shows the matched coffee shop:
- Coffee shop name
- Driving time (prominent display)
- Open/closed status with pulsing indicator dot
- Today's hours (closing time if open, opening time if closed)
- "TAKE ME THERE" navigation button
- "use a different app" fallback link
- "search again" link to reset

Transitions:
- User clicks "search again" -> Input state (form cleared)

## Error: No Results

Shown when no coffee shops are found at any search radius:
- Sympathetic message ("no coffee nearby? that's a crisis.")
- "try again" link to reset to Input state

## Error: API/Network Failure

Shown when a server function fails:
- Gentle error message ("something went wrong. give it another shot.")
- "try again" link to reset to Input state

## Error: Geolocation Denied

Shown inline (not a full state change) when the browser denies geolocation:
- Message below the geolocation button ("no worries, just type your address")
- Address input remains active and usable
