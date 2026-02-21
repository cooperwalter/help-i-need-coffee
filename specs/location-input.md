# Location Input

The location input system lets users provide their current location via browser geolocation or by typing an address with autocomplete.

## Browser Geolocation

A prominent "Use my current location" button triggers the browser Geolocation API.

On success, the returned latitude/longitude coordinates are passed directly to the coffee shop search. On denial or timeout, a gentle error message is displayed encouraging the user to type their address instead. The geolocation request uses `enableHighAccuracy: false` for faster response and times out after 8 seconds.

## Address Autocomplete

A text input field uses Google Places Autocomplete (proxied through a TanStack Start server function) to suggest addresses as the user types.

Autocomplete requests are debounced by 300ms. The dropdown shows up to 5 suggestions. Selecting a suggestion geocodes it to coordinates and triggers the coffee shop search. The autocomplete is biased toward the user's general region using the browser's approximate IP-based location hint when available.

The input has a clear/reset affordance when text is present. Keyboard navigation (arrow keys + enter) works on the suggestions dropdown. The dropdown closes on outside click or Escape key.

The input section sits at a higher z-index than content below it so the autocomplete dropdown always overlays the result card and other sections. The component exposes an `onEditingChange` callback that fires `true` when the user types a non-empty query and `false` when the input is blurred, cleared, or a suggestion is selected. The parent uses this to fade the result card while the user is actively changing the address.

## Priority

Browser geolocation is presented first (larger, more prominent) because it is faster and more accurate for the target use case. Address input is always available as a fallback.
