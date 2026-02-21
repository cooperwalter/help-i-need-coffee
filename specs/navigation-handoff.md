# Navigation Handoff

The navigation handoff opens the user's maps app with driving directions to the matched coffee shop.

## Platform Detection

The app detects the user's platform from the browser user agent:
- iOS Safari: Apple Maps
- Android: Google Maps app
- Desktop/other: Google Maps web

## Primary Action

The "TAKE ME THERE" button is the largest interactive element on the result screen. Tapping it opens the detected platform's maps app with driving navigation to the coffee shop's coordinates.

URL schemes:
- Apple Maps: `maps://maps.apple.com/?daddr={lat},{lng}&dirflg=d`
- Google Maps app: `google.navigation:q={lat},{lng}&mode=d` (with `comgooglemaps://` fallback)
- Google Maps web: `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}&travelmode=driving`
- Waze: `https://waze.com/ul?ll={lat},{lng}&navigate=yes`

## Fallback Options

A "use a different app" text link below the main button reveals options for Apple Maps, Google Maps, and Waze. This accommodates users who prefer a non-default maps app.

## Behavior

The maps app opens in a new context (new tab on desktop, app switch on mobile). The coffee finder app remains in place so the user can return to it if needed.
