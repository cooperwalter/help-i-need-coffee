# Testing

The project targets near-complete test coverage using bun test with TypeScript strict mode.

## Server Function Tests

Each server function has unit tests with mocked Google API responses.

### searchNearbyShops tests
- should return the nearest coffee shop by driving time when multiple shops are found
- should expand search radius from 5km to 10km when no shops found at 5km
- should expand search radius from 10km to 20km when no shops found at 10km
- should return empty result with status when no shops found at any radius
- should include open/closed status and today's hours in the response
- should handle Google Nearby Search API errors with a typed error response
- should handle Google Directions API errors with a typed error response
- should retry once on 429/500/503 errors from Google API
- should timeout after 10 seconds per Google API call
- should never include the Google API key in the response

### getPlaceAutocomplete tests
- should return up to 5 formatted address suggestions
- should return empty array for queries with no matches
- should handle Google Autocomplete API errors with a typed error response
- should validate that the input string is non-empty

### getDirections tests
- should return driving time in minutes between two coordinates
- should handle Google Directions API errors with a typed error response
- should handle no-route-found responses

## Client Utility Tests

### Platform detection tests
- should detect iOS from Safari mobile user agent
- should detect Android from Android user agent
- should return desktop for non-mobile user agents

### Maps URL builder tests
- should generate Apple Maps URL with correct coordinates and driving mode
- should generate Google Maps navigation URL with correct coordinates
- should generate Waze URL with correct coordinates
- should generate Google Maps web URL for desktop fallback

### Formatting tests
- should format 3 minutes as "3 min drive"
- should format 65 minutes as "1 hr 5 min drive"
- should format 1 minute as "1 min drive"
- should display "open" with closing time when shop is currently open
- should display "closed" with opening time when shop is currently closed

## Component Tests

Using React Testing Library with bun test.

### LocationInput component tests
- should render the geolocation button and address input
- should call the geolocation API when the location button is clicked
- should display autocomplete suggestions when the user types an address
- should select a suggestion and trigger search when a suggestion is clicked
- should show an error message when geolocation is denied
- should show an error message when geolocation times out
- should debounce autocomplete requests by 300ms

### ResultCard component tests
- should display the coffee shop name, drive time, and open status
- should display today's closing time when the shop is open
- should display today's opening time when the shop is closed
- should render the TAKE ME THERE button with the correct maps URL
- should show the "use a different app" options when the link is clicked
- should render the try-again link that resets to input state

### App state transition tests
- should start in the input state
- should transition to loading state when a location is provided
- should transition to result state when a shop is found
- should transition to error state on API failure
- should reset to input state when try-again is clicked

## Type Safety

TypeScript strict mode is enabled. All Google API responses are typed with dedicated interfaces. No `any` types anywhere in the codebase. Biome enforces this via lint rules.
