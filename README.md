# Mausam — Personalized Weather (Server-Driven UI)

A personalized weather homepage whose **entire layout is decided by the backend**.
The app ships no hardcoded page structure: a Node.js/Fastify service returns an
**SDUI JSON payload**, and the client resolves it through a **Component Registry**.

> This repository is the web build of the React Native (Expo) client — identical
> architecture, identical module seams. `storage/mmkv.ts` mirrors
> `react-native-mmkv`'s synchronous API, and the registry/renderer/storage/query
> layers port 1:1 to RN primitives.

## Architecture

```
App launch
  └─ 1. read MMKV cache SYNCHRONOUSLY (persona, location, last SDUI payload)
  └─ 2. cache hit? → render cached UI instantly (never wait on the network)
        cache miss? → skeleton homepage
  └─ 3. TanStack Query fetches GET /v1/home?persona=&location=   (background)
  └─ 4. validate payload → persist to MMKV → SDUIRenderer
  └─ 5. API failure → keep cached UI + subtle offline banner + retry

Persona switch
  └─ Zustand local state (+MMKV) → POST /v1/persona → query key change → refetch
```

- **Server state** → TanStack Query only (`queryKey: ["sdui-home", persona, locationId]`)
- **Local/UI state** → Zustand only (persona, location, offline flag, sheet)
- **Persistence** → MMKV-style sync storage (cache read happens at store init, zero async gap)

## Folder structure

```
src/
  types/sdui.ts            SDUI contract + runtime payload guards
  sdui/
    registry.tsx           Component Registry + validators + per-node ErrorBoundary
    SDUIRenderer.tsx       ordered renderer (skips unknown/malformed nodes)
  components/
    sdui/                  registry-resolved components (WeatherHero, HourlyForecast,
                           DailyForecast, WeatherAlert, Advisory, MetricsGrid, LocationSection)
    chrome/                StatusBar, AppHeader, PersonaSheet, Backdrop
    states/                OfflineBanner, HomeSkeleton, ErrorState
  screens/HomeScreen.tsx   boot flow orchestration
  store/                   Zustand store + persona display metadata
  storage/mmkv.ts          synchronous KV cache (= react-native-mmkv seam)
  services/api.ts          network layer — swap in the Fastify axios transport here
  mock/backend.ts          mock SDUI payloads (dev stand-in for the backend)
  __tests__/               vitest suites (npx vitest run)
```

## Global location search

The header location row (and the search field in the Locations card) opens a
search sheet backed by live geocoding — **any city, town or village on Earth**:

- debounced place search (Open-Meteo geocoding, no API key)
- GPS detect with reverse geocoding
- recent searches persisted to MMKV
- curated quick-pick cities resolve instantly from mock data

Custom locations flow through the exact same SDUI contract: the backend layer
fetches live Open-Meteo weather for the coordinates, normalizes it, and builds
the same persona-aware payload the renderer already understands. Production:
proxy these upstream calls through Fastify (`GET /v1/geo?query=`,
`GET /v1/home?lat=&lon=&place=`).

## Backend API contract (Fastify)

```
GET  /v1/home?persona=farmer&location=kolkata         → SDUIPayload (preset or lat/lon+place)
GET  /v1/geo?query=jaipur                             → place search results (proxied geocoding)
POST /v1/persona        { persona }                   → 202/200
```

```jsonc
// GET /v1/home response
{
  "version": "1.0",
  "persona": "farmer",
  "location": { "id": "kolkata", "city": "Kolkata", "state": "West Bengal", "lat": 22.57, "lon": 88.36 },
  "theme": "dusk",
  "generatedAt": "2026-05-12T06:10:00Z",
  "components": [
    { "id": "hero", "type": "WeatherHero", "props": { "temperature": 29, "condition": "Partly Cloudy" } },
    { "id": "advisory", "type": "Advisory", "props": { "title": "Agri Advisory" } }
  ]
}
```

To go live, replace the mock transport inside `src/services/api.ts` with the
commented axios implementation. **No secrets belong in the client** — the
Fastify service holds upstream weather-provider keys.

## SDUI security model

- Only registry-listed `type` strings can render (whitelist; no `eval`, no dynamic imports keyed by server data)
- Optional per-component prop validators; invalid nodes are skipped
- Every node renders inside an ErrorBoundary → one bad component can't crash the page
- Unknown component types, missing props, empty payloads and corrupted cache are all tolerated

## Adding a new SDUI component

1. Create `components/sdui/MyWidget.tsx` + its props interface in `types/sdui.ts`
2. Register it in `sdui/registry.tsx` with a prop validator
3. The backend can now emit `{ "type": "MyWidget", "props": {…} }` — old app versions simply skip it

## Scripts

```bash
npm run dev        # start dev server
npm run build      # production build
npx vitest run     # unit tests (registry, renderer, cache, API, persona switching)
```

## Offline-first demo

Open the persona sheet → **Developer → Simulate backend outage**. API calls fail;
the app keeps serving the last synced payload, shows the stale-data banner, and
auto-recovers when the outage is lifted. Relaunching the app still renders the
cached homepage synchronously — never a blank screen.
