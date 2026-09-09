# 🌦️ Mausam — Personalized Weather Homepage

<p align="center">
  <strong>A modern Server-Driven UI frontend for a personalized weather experience</strong>
</p>

<p align="center">
  <a href="https://github.com/SreejoySarkar/mausam-sdui-frontend-development"><img src="https://img.shields.io/badge/Mausam-SDUI-0ea5e9?style=for-the-badge" alt="Mausam SDUI"></a>
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-7-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
</p>

<p align="center">
  <em>Weather information that adapts to the user, location, and context.</em>
</p>

---

## 📌 Overview

**Mausam** is a personalized weather homepage built around **Server-Driven UI (SDUI)**. Instead of shipping a single rigid homepage layout inside the client, the frontend receives a structured SDUI payload from the backend and renders the experience from that payload.

The backend can decide:

- Which components should appear
- The order in which they appear
- Which weather information should be prioritized
- Which persona-specific advisories should be shown
- Which visual theme should be used

The frontend provides the **safe rendering capabilities**, while the server controls the **composition of the homepage**.

This repository is the web build of the Mausam client and is structured around the same module boundaries intended for a React Native / Expo implementation.

---

## 🎯 Problem Statement

> **Development of Personalized Homepage for the “Mausam” Mobile Application**

A general-purpose weather screen is not equally useful to every user.

A farmer may need rainfall and agricultural advisories. A fisherman may care about wind and marine conditions. A traveller may prioritize precipitation and travel-oriented weather information. An outdoor user may care about UV exposure and heat risk.

Mausam addresses this problem through **persona-aware Server-Driven UI**.

```text
                         USER
                          │
                          ▼
                    Selected Persona
                          │
                          ▼
                 Mausam Backend Logic
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
          Weather      Alerts      Advisories
             │            │            │
             └────────────┼────────────┘
                          ▼
                    SDUI JSON
                          │
                          ▼
                  Mausam Frontend
                          │
                          ▼
              Personalized Homepage
```

---

## ✨ Core Features

### 🧠 Server-Driven UI

The homepage is assembled from a backend-provided component tree instead of a permanently hardcoded page structure.

### 👤 Persona-Based Personalization

Supported personas include:

| Persona | Typical Priority |
|---|---|
| 🌍 General | Balanced everyday weather information |
| 🌾 Farmer | Rainfall, heat, wind and agricultural advisories |
| 🎓 Student | Commute conditions, rain probability and forecast |
| ✈️ Traveller | Precipitation, temperature, wind and travel advisories |
| 🎣 Fisherman | Wind, gusts, marine conditions and alerts |
| 🥾 Outdoor | UV, heat risk, rainfall and safe activity windows |

### 📍 Global Location Search

The location experience supports:

- Debounced place search
- City, town and village lookup
- GPS detection with reverse geocoding
- Recent searches persisted locally
- Curated quick-pick locations
- Coordinate-based weather flows

### ⚡ Offline-First Boot

Cached SDUI content is read synchronously so the application can show the last known homepage immediately instead of waiting for the network.

### 🛡️ Defensive SDUI Rendering

The renderer validates data, uses a component whitelist, validates component props, and isolates component failures with Error Boundaries.

### 🎨 Dynamic Themes

The payload can select an atmosphere such as:

`dusk` · `monsoon` · `heat` · `marine` · `cloud`

### 🎞️ Smooth Motion

Framer Motion provides lightweight entrance transitions while preserving the information hierarchy.

---

## 🏗️ Architecture

```text
                    ┌─────────────────────────┐
                    │     Mausam Backend      │
                    │     Node.js / Fastify   │
                    └────────────┬────────────┘
                                 │
                         SDUI JSON payload
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      API Service         │
                    │     src/services/api.ts  │
                    └────────────┬────────────┘
                                 │
                         validate payload
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │       HomeScreen        │
                    │ cache + query + states  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      SDUIRenderer       │
                    └────────────┬────────────┘
                                 │
                          registry lookup
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Component Registry    │
                    │ whitelist + validators  │
                    └────────────┬────────────┘
                                 │
             ┌───────────────────┼───────────────────┐
             ▼                   ▼                   ▼
        Weather Hero          Forecasts           Advisories
             │                   │                   │
             └───────────────────┼───────────────────┘
                                 ▼
                      Personalized Homepage
```

---

## 🔄 SDUI Rendering Pipeline

The renderer follows a predictable pipeline:

```text
SDUI JSON
   │
   ▼
Payload validation
   │
   ▼
SDUIRenderer
   │
   ▼
Component Registry
   │
   ├── WeatherHero
   ├── HourlyForecast
   ├── DailyForecast
   ├── WeatherAlert
   ├── Advisory
   ├── MetricsGrid
   └── LocationSection
   │
   ▼
React component
   │
   ▼
Rendered UI
```

The renderer processes components in the order supplied by the backend. Unknown or malformed nodes are skipped rather than being allowed to crash the page. fileciteturn14file0

### The architectural principle

> **Backend decides what to show. Frontend decides how registered components render.**

---

## 📦 SDUI Payload Model

The frontend defines a typed contract for the SDUI envelope.

```json
{
  "version": "1.0",
  "persona": "farmer",
  "location": {
    "id": "kolkata",
    "city": "Kolkata",
    "state": "West Bengal",
    "label": "Kolkata, West Bengal",
    "lat": 22.5726,
    "lon": 88.3639
  },
  "theme": "monsoon",
  "generatedAt": "2026-09-09T08:00:00.000Z",
  "components": [
    {
      "id": "hero",
      "type": "WeatherHero",
      "props": {
        "temperature": 29,
        "condition": "Partly Cloudy"
      }
    },
    {
      "id": "advisory",
      "type": "Advisory",
      "props": {
        "title": "Agri Advisory"
      }
    }
  ]
}
```

The TypeScript contract includes persona, theme, severity, accent, location metadata, component nodes, weather hero data, hourly/daily forecasts, alerts, advisories, metrics and saved locations. Runtime guards reject structurally invalid payloads before rendering. fileciteturn13file0

---

## 🧩 Component System

| Component | Responsibility |
|---|---|
| `WeatherHero` | Current temperature, condition, feels-like, high/low and quick stats |
| `HourlyForecast` | Hour-by-hour temperature and precipitation |
| `DailyForecast` | Multi-day forecast |
| `WeatherAlert` | Weather warnings and severity |
| `Advisory` | Persona-specific recommendations and weather intelligence |
| `MetricsGrid` | Weather metrics and visual gauges |
| `LocationSection` | Current and saved locations |

All server-controlled component types pass through the registry before they can render. fileciteturn15file0

---

## 🛡️ SDUI Security & Reliability

Server-driven interfaces must treat network data as untrusted input. Mausam therefore places multiple defensive boundaries between the payload and the UI.

### 1. Payload validation

```text
Network payload
      ↓
Runtime validation
      ↓
Invalid → reject
Valid   → renderer
```

### 2. Component whitelist

Only component types explicitly present in the registry are allowed to render.

There is:

- No `eval`
- No server-controlled JSX
- No arbitrary JavaScript execution
- No uncontrolled dynamic imports keyed by server data

### 3. Prop validation

Registered components can define validators that check the minimum shape required for rendering.

### 4. Error Boundary isolation

Each SDUI node is wrapped in an Error Boundary. A single component failure does not need to take down the entire homepage.

### 5. Graceful degradation

Unknown components and invalid nodes can simply disappear from the rendered tree while valid components continue working.

### 6. Secrets stay server-side

Weather-provider credentials should never be placed in the frontend bundle. The API layer is intentionally designed so upstream provider access can be handled by the backend. fileciteturn16file0

---

## ⚡ Offline-First Architecture

Mausam is designed so that a previously synchronized homepage remains useful during network failures.

```text
App Launch
    │
    ▼
Read cached SDUI synchronously
    │
    ├── Cache found ─────► Render immediately
    │                           │
    │                           ▼
    │                    Fetch fresh payload
    │                           │
    │                           ▼
    │                    Validate + persist
    │
    └── No cache ───────► Skeleton
                               │
                               ▼
                         Fetch backend
```

When the backend becomes unavailable:

- Existing cached content remains visible.
- A stale/offline state can be displayed.
- The user can retry.
- Connectivity recovery can trigger refetching.

The `HomeScreen` coordinates cache reads, TanStack Query fetching, payload persistence, connectivity listeners, theme updates and fallback states. fileciteturn17file0

---

## 📍 Location Architecture

The location layer is designed around a single SDUI contract.

```text
Search / GPS
    │
    ▼
Geocoding
    │
    ▼
LocationMeta
    │
    ▼
Weather request
    │
    ▼
Persona-aware SDUI payload
    │
    ▼
Same renderer
```

This means a custom location does not require a separate UI implementation. The location simply becomes another input to the backend/data pipeline.

The intended production backend endpoints include:

```http
GET  /v1/geo?query=<place>
GET  /v1/home?persona=<persona>&location=<location>
POST /v1/persona
```

---

## 🧠 State Management

Mausam separates server state from local application state.

| Responsibility | Technology |
|---|---|
| Server state | TanStack Query |
| Local/UI state | Zustand |
| Persistent cache | MMKV-style storage layer |
| UI rendering | React |
| Styling | Tailwind CSS |
| Animation | Framer Motion |

### TanStack Query

Used for:

- Request lifecycle
- Server cache
- Stale state
- Retry behavior
- Background refetching
- Query keys based on persona and location

### Zustand

Used for lightweight application state such as:

- Persona
- Location
- Online/offline state
- Theme
- Developer/offline simulation state

### Persistence

The storage abstraction mirrors synchronous MMKV-style semantics, keeping the cache seam suitable for the intended React Native / Expo implementation.

---

## 📂 Project Structure

```text
mausam-sdui-frontend-development/
│
├── src/
│   ├── components/
│   │   ├── chrome/
│   │   │   ├── AppHeader.tsx
│   │   │   ├── Backdrop.tsx
│   │   │   ├── PersonaSheet.tsx
│   │   │   └── StatusBar.tsx
│   │   │
│   │   ├── sdui/
│   │   │   ├── AdvisoryCard.tsx
│   │   │   ├── DailyForecast.tsx
│   │   │   ├── HourlyForecast.tsx
│   │   │   ├── LocationSection.tsx
│   │   │   ├── MetricsGrid.tsx
│   │   │   ├── WeatherAlertCard.tsx
│   │   │   └── WeatherHero.tsx
│   │   │
│   │   └── states/
│   │       ├── ErrorState.tsx
│   │       ├── HomeSkeleton.tsx
│   │       └── OfflineBanner.tsx
│   │
│   ├── screens/
│   │   └── HomeScreen.tsx
│   │
│   ├── sdui/
│   │   ├── registry.tsx
│   │   └── SDUIRenderer.tsx
│   │
│   ├── services/
│   │   └── api.ts
│   │
│   ├── mock/
│   │   └── backend.ts
│   │
│   ├── storage/
│   │   └── mmkv.ts
│   │
│   ├── store/
│   │   └── useAppStore.ts
│   │
│   ├── types/
│   │   └── sdui.ts
│   │
│   ├── lib/
│   │   ├── format.ts
│   │   ├── icons.ts
│   │   └── theme.ts
│   │
│   ├── __tests__/
│   │   ├── offline.test.ts
│   │   └── sdui.test.tsx
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── public/
├── package.json
├── tsconfig*.json
├── vite.config.*
└── README.md
```

---

## 🛠️ Tech Stack

### Core

- **React 19** — component-based UI
- **TypeScript 5.9** — type safety
- **Vite 7** — development and production tooling
- **Tailwind CSS 4** — styling

### Application

- **TanStack Query** — server-state management
- **Zustand** — local state management
- **Framer Motion** — animations
- **Lucide React** — icons

### Testing

- **Vitest** — test runner
- **JSDOM** — browser-like test environment

The current project dependency configuration is defined in `package.json`. fileciteturn12file0

---

## 🚀 Getting Started

### Prerequisites

Install:

- Node.js
- npm
- Git

### 1. Clone

```bash
git clone https://github.com/SreejoySarkar/mausam-sdui-frontend-development.git
cd mausam-sdui-frontend-development
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

### 4. Create production build

```bash
npm run build
```

### 5. Preview production build

```bash
npm run preview
```

The repository currently defines Vite `dev`, `build`, and `preview` scripts. fileciteturn12file0

---

## 🧪 Testing

Run the test suite with:

```bash
npx vitest run
```

Recommended test coverage includes:

- Valid SDUI payloads
- Invalid payload handling
- Unknown component types
- Invalid component props
- Error Boundary isolation
- Cache restoration
- Offline behavior
- Persona switching
- API retry behavior

---

## 🔌 Backend Integration

The frontend intentionally isolates network communication inside `src/services/api.ts`.

The current development implementation uses the mock backend. The service contains the intended production transport seam for a Node.js/Fastify backend and validates the returned payload before rendering. fileciteturn16file0

### Intended production flow

```text
Frontend
   │
   │ GET /v1/home
   ▼
Fastify Backend
   │
   ├── Weather APIs
   ├── Geocoding
   ├── Persona logic
   ├── Alerts
   ├── Advisories
   └── SDUI composition
   │
   ▼
SDUIPayload
   │
   ▼
Frontend validation
   │
   ▼
SDUIRenderer
```

### API Contract

```http
GET /v1/home?persona=farmer&location=kolkata
```

```http
GET /v1/geo?query=jaipur
```

```http
POST /v1/persona
Content-Type: application/json

{
  "persona": "farmer"
}
```

---

## 🎨 Theme System

The backend can select a theme as part of the SDUI payload.

Supported theme identifiers include:

- `dusk`
- `monsoon`
- `heat`
- `marine`
- `cloud`

The frontend then applies the corresponding visual atmosphere while keeping the component composition server-driven.

---

## 🧱 Adding a New SDUI Component

Suppose you want to add `PollenCard`.

### Step 1 — Create the component

```text
src/components/sdui/PollenCard.tsx
```

### Step 2 — Define its props

Add the TypeScript interface in:

```text
src/types/sdui.ts
```

### Step 3 — Register it

Add it to:

```text
src/sdui/registry.tsx
```

### Step 4 — Add validation

Create a runtime validator for the minimum required props.

### Step 5 — Emit it from the backend

```json
{
  "id": "pollen",
  "type": "PollenCard",
  "props": {}
}
```

Older frontend versions that do not know the component can safely skip it, which helps the SDUI contract evolve without forcing every client release to understand every future component.

---

## 🧪 Offline Demo

The application includes a developer-oriented offline simulation flow.

Open the persona sheet and use:

```text
Developer → Simulate backend outage
```

The expected behavior is:

```text
Backend outage
     │
     ▼
Request fails
     │
     ▼
Cached payload remains
     │
     ├── Show stale/offline state
     └── Allow retry
```

When the simulated outage is removed, the application can recover through a fresh request.

---

## 📱 Web → Mobile Design

The project is intentionally structured so that the core SDUI architecture can map cleanly to a React Native / Expo client.

```text
                 Shared Mausam Backend
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
        React Web              React Native / Expo
             │                       │
             └───────────┬───────────┘
                         ▼
                  Shared SDUI Contract
```

The main reusable concepts are:

- SDUI payload contract
- Persona model
- Location model
- Component type names
- Component props
- Registry/renderer architecture
- Cache and synchronization strategy

---

## 📊 Why SDUI?

### Traditional approach

```text
Frontend code
     │
     └── fixed layout
          ├── Hero
          ├── Hourly
          ├── Daily
          └── Metrics
```

Changing the composition generally requires a client-side code change and release.

### Mausam SDUI approach

```text
Backend
   │
   └── component tree
        ├── Hero
        ├── Advisory
        ├── Alert
        └── Metrics
              │
              ▼
         SDUI Renderer
              │
              ▼
         Existing React components
```

This allows the backend to experiment with different homepage compositions while the frontend remains a controlled rendering platform.

### Benefits

- Personalized experiences
- Faster layout experimentation
- Centralized composition logic
- Explicit frontend/backend contracts
- Safer evolution of UI capabilities
- Reduced need for client releases for every ordering/content decision

---

## 🔐 Engineering Principles

### Separation of Concerns

```text
Backend → What should be shown?
Frontend → How should it be rendered?
```

### Validate at Boundaries

Never assume network data is valid.

### Fail Soft

One broken component should not destroy the entire homepage.

### Cache First

Previously synchronized information should remain useful during temporary connectivity problems.

### Explicit Capabilities

The server can select only components deliberately exposed by the frontend registry.

### Server-Side Secrets

Upstream weather credentials belong on the backend.

---

## 📈 Roadmap

### Phase 1 — Frontend Foundation

- [x] React + TypeScript setup
- [x] SDUI type system
- [x] Component registry
- [x] SDUI renderer
- [x] Persona model
- [x] Weather component library
- [x] Offline/cache flow
- [x] Runtime validation
- [x] Error isolation
- [x] Location search architecture

### Phase 2 — Production Backend

- [ ] Connect live Fastify service
- [ ] Integrate production weather providers
- [ ] Production geocoding proxy
- [ ] Persona-specific SDUI composition
- [ ] Shared runtime schema validation
- [ ] API observability

### Phase 3 — Product Experience

- [ ] Severe weather push notifications
- [ ] Multilingual content
- [ ] Voice weather queries
- [ ] Advanced agricultural intelligence
- [ ] Marine intelligence
- [ ] Richer location experience
- [ ] Native mobile deployment
- [ ] CI/CD automation

---

## 🤝 Contributing

1. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

2. Make your changes.

3. Build the project.

```bash
npm run build
```

4. Run tests.

```bash
npx vitest run
```

5. Commit and push.

```bash
git add .
git commit -m "feat: describe your change"
git push origin feature/your-feature
```

6. Open a pull request with a clear explanation of the change.

---

## 📌 Project Status

This repository contains the **Mausam personalized SDUI frontend**.

The frontend already implements the core architecture required for a production SDUI client:

- Typed SDUI contracts
- Runtime payload guards
- Component registry
- Component-level validation
- Error Boundary isolation
- Persona-based state
- Location-aware queries
- Offline-first caching
- Mock backend integration
- Production API abstraction
- Weather-focused component library

The current network layer uses mock transport for development, while the architecture is prepared for connection to the Mausam Node.js/Fastify backend. fileciteturn16file0turn17file0

---

## 👨‍💻 Author

**Sreejoy Sarkar**

B.Tech — Computer Science & Engineering (Cyber Security)

GitHub: [@SreejoySarkar](https://github.com/SreejoySarkar)

---

## ⭐ Why This Project Matters

Mausam demonstrates more than a standard weather dashboard. It combines modern frontend engineering with an architecture designed for **personalization, resilience, and controlled server-driven experiences**.

### Concepts demonstrated

- ⚛️ Modern React architecture
- 🔷 TypeScript contracts
- 🧠 Server-Driven UI
- 👤 Persona-based personalization
- 📍 Location-aware experiences
- ⚡ Offline-first UX
- 🛡️ Defensive rendering
- 🔄 Server-state management
- 💾 Persistent local state
- 🎨 Dynamic visual themes
- 🧩 Extensible component architecture
- 🧪 Automated testing strategy

> **Mausam — Weather that adapts to you.** 🌦️
