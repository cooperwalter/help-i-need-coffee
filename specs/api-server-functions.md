# API Server Functions

All external API calls are proxied through TanStack Start server functions. The Google Places API key is stored as an environment variable and never exposed to the client.

## Environment Variables

- `GOOGLE_PLACES_API_KEY`: Google API key with Places API, Directions API, and Places Autocomplete enabled.

## Server Functions

### searchNearbyShops

Input: `{ lat: number; lng: number }`

Behavior:
1. Query Google Places Nearby Search with type `cafe`, keyword `coffee`, starting at 5km radius.
2. If no results, expand to 10km, then 20km.
3. Take the top 5 results by distance.
4. Query Google Directions API for driving time from user's coordinates to each shop.
5. Return the shop with the shortest driving time.

Output (success):
```
{
  name: string
  driveTimeMinutes: number
  isOpen: boolean
  todayHours: { open: string; close: string } | null
  coordinates: { lat: number; lng: number }
  placeId: string
}
```

Output (error):
```
{
  error: true
  message: string
  code: "NO_RESULTS" | "API_ERROR" | "TIMEOUT"
}
```

### getPlaceAutocomplete

Input: `{ query: string; locationBias?: { lat: number; lng: number } }`

Behavior: Query Google Places Autocomplete, biased toward the provided location if available. Return up to 5 suggestions.

Output (success):
```
{
  suggestions: Array<{
    description: string
    placeId: string
    coordinates: { lat: number; lng: number }
  }>
}
```

Output (error):
```
{
  error: true
  message: string
  code: "API_ERROR" | "INVALID_INPUT"
}
```

### getDirections

Input: `{ origin: { lat: number; lng: number }; destination: { lat: number; lng: number } }`

Behavior: Query Google Directions API for driving time between two points.

Output (success):
```
{
  driveTimeMinutes: number
  distanceMeters: number
}
```

Output (error):
```
{
  error: true
  message: string
  code: "NO_ROUTE" | "API_ERROR" | "TIMEOUT"
}
```

## Error Handling

All server functions retry once on HTTP 429, 500, or 503 from Google. Each Google API call uses a 10-second timeout. Errors are returned as typed objects, never thrown as exceptions to the client.

## Rate Limiting

Server functions are not rate-limited in the MVP. The Google API's own quotas provide a natural ceiling.
