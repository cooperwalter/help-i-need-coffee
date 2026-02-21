# Coffee Shop Search

The search system finds the single nearest coffee shop by driving time from the user's location.

## Search Process

A TanStack Start server function receives the user's coordinates and queries the Google Places Nearby Search API for coffee shops.

The search uses type `cafe` and keyword `coffee`. It starts with a 5km radius. If no results are found, it expands to 10km, then 20km. If still no results, the user is shown a "no coffee shops found nearby" message.

## Ranking

Results are ranked by driving time, not straight-line distance. The server function takes the top 5 nearest-by-distance results from Google Places, then queries the Google Directions API for driving time to each. The shop with the shortest driving time is returned.

Only the single best result is returned to the client. This is deliberate — the app is not for comparison shopping.

## Response Shape

The server function returns:
- Shop name
- Driving time in minutes
- Open/closed status (boolean)
- Today's hours (opening and closing time)
- Shop coordinates (latitude, longitude)
- Place ID (for potential future use)

## Error Handling

Google API errors return a typed error response with a user-friendly message. The server function retries once on 429, 500, or 503 status codes. Each Google API call times out after 10 seconds. The Google API key is never exposed in responses.
