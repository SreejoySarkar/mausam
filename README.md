# 🌦️ Mausam

<p align="center">
  <img src="https://img.shields.io/badge/Mausam-Personalized%20Weather-0f172a?style=for-the-badge" alt="Mausam">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 7">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/Fastify-5-000000?style=for-the-badge&logo=fastify&logoColor=white" alt="Fastify 5">
  <img src="https://img.shields.io/badge/TanStack_Query-5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query 5">
  <img src="https://img.shields.io/badge/Zustand-5-443E38?style=for-the-badge" alt="Zustand 5">
</p>

<p align="center">
  <strong>Weather that adapts to the user.</strong><br>
  A personalized, resilient weather platform built around Server-Driven UI (SDUI).
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-features">Features</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

---

## 📌 Overview

**Mausam** is a modern weather application prototype focused on the problem statement:

> **Development of a Personalized Homepage for the “Mausam” Mobile Application**

The core idea is simple: **different people need different weather information**.

A farmer may care more about soil moisture and rainfall. A student may care about commute conditions. A fisherman needs marine conditions and tides. A traveller may need route, transit and flight information. An outdoor user may care about UV, visibility and rain risk.

Instead of hard-coding one dashboard for everyone, Mausam uses a **Server-Driven UI architecture**. The backend/gateway determines the composition and priority of the homepage, while the React client renders only known, registered UI components.

### The guiding principle

```text
                 USER CONTEXT
          ┌──────────┼──────────┐
          │          │          │
       Persona    Location   Situation
          │          │          │
          └──────────┼──────────┘
                     ▼
              SDUI GATEWAY
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Weather      AQI       Marine
          │          │          │
          └──────────┼──────────┘
                     ▼
             Normalized Metrics
                     │
                     ▼
              SDUI Layout JSON
                     │
                     ▼
             Safe React Renderer
                     │
                     ▼
          Personalized Homepage
```

---

## 🎯 Problem Statement

Traditional weather applications often present essentially the same information to every user. Mausam explores a more context-aware approach where the homepage can change according to the user's needs.

| Persona | Priority information |
|---|---|
| 🌍 **General** | Temperature, rain, humidity, visibility, AQI |
| 🌾 **Farmer** | Rain, soil moisture, humidity, temperature, UV |
| 🎓 **Student** | Traffic, rain, visibility, temperature, humidity |
| ✈️ **Traveller** | Visibility, rain, temperature, humidity, UV, travel status |
| 🎣 **Fisherman** | Waves, water temperature, humidity, visibility, rain, tides |
| 🥾 **Outdoor** | Temperature, UV, humidity, rain, visibility |
| ❤️ **Health** | AQI, UV, pollen, humidity and visibility |
| 👨‍👩‍👧 **Parent** | School commute, rain, visibility, heat and severe-weather guidance |
| 🎪 **Event** | Outdoor comfort, rain, heat, visibility and setup conditions |

This turns the application from a **weather dashboard** into a **personalized weather information platform**.

---

# 💡 What Makes Mausam Different?

### Conventional weather application

```text
User
  ↓
Fixed API Response
  ↓
Fixed UI
  ↓
Same dashboard for everyone
```

### Mausam

```text
User
  ↓
Persona + Location + Context
  ↓
Data Aggregation
  ↓
Personalization / SDUI Engine
  ↓
SDUI JSON
  ↓
Registered Component Renderer
  ↓
Personalized Homepage
```

The frontend is therefore not responsible for deciding the entire information hierarchy. The SDUI layer can change the composition while keeping the visual components reusable.

---

# ✨ Features

## 🧩 1. Server-Driven UI

The **SDUI Gateway** is the central layer responsible for constructing the homepage layout.

It can determine:

- Which components are displayed
- Component ordering
- Persona-specific priorities
- Weather alerts
- Advisories
- Travel information
- Marine information
- Contextual metrics
- Location metadata

The gateway exposes SDUI responses rather than forcing the client to reproduce all personalization rules locally.

---

## 👤 2. Persona-Based Personalization

Mausam currently models the following personas in the SDUI engine:

- `general`
- `farmer`
- `student`
- `traveller`
- `fisherman`
- `outdoor`
- `health`
- `parent`
- `event`

For example, a fisherman-oriented response can prioritize wave and water information, while a student response can prioritize route traffic and commute-related information.

---

## 🌦️ 3. Live Weather Data

The gateway aggregates weather information from **Open-Meteo** using latitude and longitude.

The current implementation requests data including:

- Temperature
- Relative humidity
- Visibility
- Weather code
- Soil moisture
- Precipitation probability
- UV index
- Sunrise
- Sunset
- Hourly forecast
- Seven-day daily forecast

The response is normalized into a `RawMetrics` structure before it reaches the SDUI engine.

---

## 🌫️ 4. Air Quality & Pollen

The SDUI gateway integrates the **Open-Meteo Air Quality API** for:

- US AQI
- PM2.5
- Pollen measurements

The gateway derives a dominant pollen reading and classifies it as:

```text
low
moderate
high
very high
```

This allows the health-oriented persona to surface environmental information alongside normal weather data.

---

## 🌊 5. Marine Weather

For marine use cases, the gateway integrates the **Open-Meteo Marine API**.

Available marine metrics include:

- Wave height
- Wave direction
- Wave period
- Sea-surface temperature

The SDUI engine also derives a simple sea-state classification:

```text
< 0.5 m       → Calm
0.5–1.25 m    → Slight
1.25–2.5 m    → Moderate
≥ 2.5 m       → Rough
```

This is particularly relevant to the **fisherman** persona.

---

## 🌊 6. Tide Integration

Optional WorldTides integration can provide high and low tide events.

If `WORLDTIDES_API_KEY` is not configured, the application does **not fabricate tide information**. Instead, the SDUI response indicates that tide timings are not configured for that deployment.

---

## 🚗 7. Route & Traffic Information

The gateway can use **TomTom Routing** to calculate route information when a complete route and `TOMTOM_API_KEY` are available.

It can return:

- Traffic delay
- Total travel time
- Estimated free-flow travel time

Route coordinates are supplied through:

```text
originLat
originLon
destinationLat
destinationLon
```

This is particularly useful for the **student** and **traveller** experiences.

---

## ✈️ 8. Travel-Aware Personalization

Traveller requests can include:

- Domestic / international travel type
- Flight / bus / train mode
- Travel date
- Flight number

The gateway has separate provider integrations for flight and transit information. Provider API keys are optional and are required only for the corresponding live functionality.

---

## 📍 9. Location Search

The SDUI Gateway exposes a location-search endpoint backed by TomTom Search.

The flow is:

```text
Search text
    ↓
TomTom Search
    ↓
Place + coordinates
    ↓
Location object
    ↓
Weather request
```

This keeps location discovery separate from weather rendering.

---

## ⚡ 10. Caching & Resilience

The gateway supports a two-level cache architecture:

```text
                    Request
                       │
                       ▼
                 Redis Cache
                  /       \
              HIT          MISS
               │             │
               ▼             ▼
             Return      PostgreSQL
                            /     \
                         HIT       MISS
                          │          │
                          ▼          ▼
                        Return   Upstream APIs
                                      │
                                      ▼
                              Store snapshot
                                      │
                                      ▼
                                    Return
```

### Redis

Used as the hot cache with a **15-minute TTL**.

### PostgreSQL

Stores durable `WeatherSnapshot` records that can act as a fallback cache layer.

### Graceful degradation

Redis and PostgreSQL are optional for local development. If the cache services are unavailable, the gateway can continue by requesting upstream provider data.

---

## 🛡️ 11. Defensive SDUI Rendering

SDUI payloads are treated as data, not executable code.

The architecture is designed around:

- Registered component types
- Structured JSON
- Payload validation
- Safe component lookup
- Graceful handling of unknown components
- Component-level error isolation

The client should never execute arbitrary JavaScript or JSX received from a server.

```text
Server JSON
    ↓
Validate
    ↓
Known component?
   /       \
 NO        YES
  ↓          ↓
Ignore     Render
```

---

## 🔔 12. Weather Alert Infrastructure

The repository also contains a backend alert pipeline using **Fastify + KafkaJS**.

The alert flow is:

```text
Severe Weather Event
        ↓
Fastify Webhook
        ↓
Kafka Producer
        ↓
Kafka Topic
        ↓
Kafka Consumer
        ↓
Notification / Alert Handling
```

The existing backend exposes a severe-weather webhook:

```http
POST /webhooks/severe-weather
```

Required request fields:

```json
{
  "title": "Heavy Rain Warning",
  "description": "Heavy rainfall is expected.",
  "targetProfile": "general",
  "severity": "amber"
}
```

A valid request is queued with a `202 Accepted` response.

---

## 🌅 13. Sunrise & Sunset

The backend integration also supports astronomical calculations through **SunCalc**.

```text
Latitude + Longitude
        ↓
      SunCalc
        ↓
 Sunrise + Sunset
```

These values can be used by the UI for day/night context, themes and future recommendations.

---

# 🏗️ Architecture

Mausam is organized into several logical layers.

```text
┌─────────────────────────────────────────────────────────┐
│                     MAUSAM CLIENT                       │
│              React + TypeScript + Vite                 │
│                                                         │
│  UI Components • SDUI Renderer • State • API Services │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    SDUI GATEWAY                         │
│                 Fastify + TypeScript                   │
│                                                         │
│  Routing • Data Aggregation • Personalization • SDUI  │
└───────────────┬──────────────┬──────────────┬───────────┘
                │              │              │
                ▼              ▼              ▼
          Open-Meteo       TomTom        Travel APIs
          Weather/AQI      Search/Route  Flight/Transit
                │
                ▼
        Redis + PostgreSQL
                │
                ▼
          SDUI JSON Payload
```

A separate `mausam_backend` area contains additional backend integrations such as Fastify alert routes, Kafka producer/consumer infrastructure, Firebase Admin integration, Open-Meteo weather utilities, AQI integration and marine/sun calculations.

---

# 🔄 End-to-End Request Flow

When the frontend is connected to the gateway, a typical homepage request looks like this:

```text
1. User selects a persona
              ↓
2. User selects/searches a location
              ↓
3. Frontend requests /v1/home
              ↓
4. Gateway parses persona + coordinates
              ↓
5. Cache is checked
              ↓
6. Required upstream APIs are called on cache miss
              ↓
7. Weather/AQI/marine/traffic data is normalized
              ↓
8. SDUI engine selects persona priorities
              ↓
9. Alerts + metrics + advisories are composed
              ↓
10. SDUI JSON is returned
              ↓
11. Frontend validates the payload
              ↓
12. Component registry maps types to React components
              ↓
13. Personalized homepage is rendered
```

---

# 📦 SDUI Payload Model

A simplified response follows this general structure:

```json
{
  "version": "1.0",
  "persona": "farmer",
  "location": {
    "id": "geo-22.5726-88.3639",
    "city": "Kolkata",
    "state": "West Bengal",
    "label": "Kolkata",
    "lat": 22.5726,
    "lon": 88.3639
  },
  "theme": "cloud",
  "generatedAt": "2026-09-13T12:00:00.000Z",
  "components": [
    {
      "id": "hero",
      "type": "WeatherHero",
      "props": {
        "temperature": 29,
        "condition": "Current conditions"
      }
    },
    {
      "id": "metrics",
      "type": "MetricsGrid",
      "props": {}
    },
    {
      "id": "advisory",
      "type": "Advisory",
      "props": {}
    }
  ]
}
```

The **gateway controls composition and data**, while the **frontend controls the actual visual implementation** of registered components.

---

# 🧩 SDUI Component Philosophy

The application uses reusable UI components such as:

| Component | Responsibility |
|---|---|
| `WeatherHero` | Current weather summary |
| `HourlyForecast` | Hour-by-hour conditions |
| `DailyForecast` | Seven-day forecast |
| `MetricsGrid` | Persona-prioritized metrics |
| `WeatherAlert` | Weather warnings |
| `Advisory` | Persona-specific guidance |
| Marine components | Wave/water/tide information |
| Travel components | Flight/transit/route information |
| Location components | Selected/search locations |
| `SDUIRenderer` | Converts validated SDUI JSON into UI |

The component registry is intentionally safer than allowing the server to send executable frontend code.

---

# 🌐 API Reference

The main SDUI gateway listens on:

```text
http://localhost:4000
```

## `GET /`

Gateway health/info endpoint.

Example:

```text
http://localhost:4000/
```

Returns service information and available primary endpoints.

---

## `GET /v1/home`

Primary personalized-homepage endpoint.

### Query parameters

| Parameter | Required | Description |
|---|---:|---|
| `lat` | No | Latitude |
| `lon` | No | Longitude |
| `place` | No | Display location name |
| `persona` | No | User persona |
| `profile` | No | Alias for persona |
| `originLat` | No | Route origin latitude |
| `originLon` | No | Route origin longitude |
| `destinationLat` | No | Route destination latitude |
| `destinationLon` | No | Route destination longitude |
| `travelType` | No | `domestic` or `international` |
| `travelMode` | No | `flight`, `bus`, or `train` |
| `travelDate` | No | Travel date |
| `flightNumber` | No | Flight number |

Example:

```text
GET /v1/home?persona=farmer&lat=22.5726&lon=88.3639&place=Kolkata
```

The gateway currently uses a Bengaluru coordinate/name as its fallback when no coordinates/location are supplied.

---

## `GET /v1/layout`

Alias of the homepage endpoint.

```text
GET /v1/layout?persona=student&lat=22.5726&lon=88.3639&place=Kolkata
```

---

## `GET /v1/places/search`

Searches for places and returns coordinates that can be used for weather requests.

Example:

```text
GET /v1/places/search?q=Kolkata&scope=global
```

Optional nearby search parameters:

```text
GET /v1/places/search?q=restaurant&lat=22.57&lon=88.36&scope=nearby
```

---

## `POST /webhooks/severe-weather`

This endpoint belongs to the `mausam_backend` alert service rather than the SDUI gateway.

Example body:

```json
{
  "title": "Severe Weather Alert",
  "description": "Heavy rainfall expected.",
  "targetProfile": "general",
  "severity": "amber"
}
```

---

# 🧰 Technology Stack

## Frontend

- **React 19** — component-based UI
- **TypeScript 5.9** — static typing
- **Vite 7** — development/build tooling
- **Tailwind CSS 4** — utility-first styling
- **TanStack Query 5** — asynchronous/server-state management
- **Zustand 5** — lightweight application state
- **Framer Motion** — UI animation
- **Lucide React** — icons
- **Vitest / JSDOM** — frontend testing support

## SDUI Gateway

- **Node.js**
- **TypeScript**
- **Fastify 5**
- **@fastify/cors**
- **Prisma**
- **PostgreSQL**
- **Redis / ioredis**
- **tsx**

## Additional Backend

- **Fastify**
- **Axios**
- **Firebase Admin SDK**
- **KafkaJS**
- **SunCalc**
- **dotenv**

## External Data Providers

- **Open-Meteo Weather API**
- **Open-Meteo Air Quality API**
- **Open-Meteo Marine API**
- **TomTom Search/Routing APIs**
- **WorldTides** — optional tide information
- **AviationStack** — optional flight status provider
- **Navitia** — optional transit provider
- **Firebase Cloud Messaging** — notification infrastructure

---

# 📁 Repository Structure

The repository is currently organized as a combined frontend + gateway + backend project.

```text
mausam/
│
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json / frontend configuration
├── vite.config.*
│
├── src/
│   ├── components/          # Reusable React UI
│   ├── screens/             # Application screens
│   ├── services/            # API/data services
│   ├── storage/             # Local persistence helpers
│   ├── store/               # Zustand state
│   ├── types/               # TypeScript domain/SDUI types
│   └── ...
│
├── sdui-gateway/
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── docker-compose.yml
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   └── src/
│       ├── server.ts
│       ├── engine/
│       │   └── sduiEngine.ts
│       ├── services/
│       │   ├── dataAggregator.ts
│       │   ├── metricsCache.ts
│       │   └── travelProviders.ts
│       └── ...
│
└── mausam_backend/
    ├── package.json
    ├── docker-compose.yml
    └── src/
        ├── index.ts
        ├── firebaseAdmin.js
        ├── kafka/
        │   ├── producer.ts
        │   └── consumer.ts
        ├── routes/
        │   └── alerts.route.ts
        ├── services/
        │   └── externalApiService.js
        ├── utils/
        │   └── dataProcessor.js
        └── test*.js
```

> The exact frontend directory structure can evolve as the client is refactored. The important architectural boundary is between the React client, SDUI gateway, and supporting backend integrations.

---

# 🚀 Getting Started

## Prerequisites

Install:

- Node.js
- npm
- Git
- Docker Desktop — optional, for PostgreSQL and Redis

---

## 1. Clone the Repository

```bash
git clone https://github.com/SreejoySarkar/mausam.git
cd mausam
```

---

## 2. Run the Frontend

Install dependencies:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

By default, the frontend can operate in its deterministic/mock mode when `VITE_API_BASE_URL` is not supplied.

---

# 🔌 Connect the Frontend to the SDUI Gateway

Create a frontend environment file named `.env.local` (or the appropriate local Vite environment file) in the repository root:

```env
VITE_API_BASE_URL=http://localhost:4000
```

Then restart Vite:

```bash
npm run dev
```

The frontend API layer reads `VITE_API_BASE_URL` and uses the gateway when it is configured. If it is absent, the application can remain in deterministic mock mode.

```text
VITE_API_BASE_URL
        │
        ▼
Frontend API service
        │
        ▼
http://localhost:4000
        │
        ▼
/v1/home
/v1/layout
/v1/places/search
```

---

# ⚙️ Run the SDUI Gateway

Open a second terminal:

```bash
cd sdui-gateway
npm install
npm run dev
```

The gateway starts on:

```text
http://localhost:4000
```

You can check it with:

```text
http://localhost:4000/
```

Or test a personalized response:

```text
http://localhost:4000/v1/home?persona=farmer&lat=22.5726&lon=88.3639&place=Kolkata
```

---

# 🗄️ Optional Redis + PostgreSQL Setup

The gateway supports Redis and PostgreSQL caching.

From `sdui-gateway`:

```bash
docker compose up -d
```

This starts:

```text
PostgreSQL → localhost:5432
Redis      → localhost:6379
```

Copy the environment template:

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

The example file contains the local database/cache configuration:

```env
DATABASE_URL=postgresql://mausam:mausam@localhost:5432/mausam?schema=public
REDIS_URL=redis://localhost:6379
```

Generate Prisma client and create the initial migration:

```bash
npm run db:generate
npm run db:migrate
```

The database contains a `WeatherSnapshot` model used for durable weather-cache snapshots.

---

# 🔑 Environment Variables

## SDUI Gateway

| Variable | Purpose | Required? |
|---|---|---:|
| `TOMTOM_API_KEY` | Place search and route traffic | Optional |
| `DATABASE_URL` | PostgreSQL connection | Optional |
| `REDIS_URL` | Redis connection | Optional |
| `WORLDTIDES_API_KEY` | Tide information | Optional |
| `AVIATIONSTACK_API_KEY` | Flight status | Optional |
| `NAVITIA_API_KEY` | Bus/train provider | Optional |

The repository includes:

```text
sdui-gateway/.env.example
```

Use it as the starting point for local configuration.

---

## Additional Backend

The `mausam_backend` integration area may use environment variables for external services such as AQI and mapping/notification configuration.

Keep all credentials in `.env` or your deployment secret manager.

---

# 🔐 Security

**Never commit secrets to GitHub.**

Do not commit:

```text
.env
.env.local
Firebase service-account credentials
API keys
Private tokens
Database passwords
Kafka credentials
```

Use environment variables instead.

For example:

```text
TOMTOM_API_KEY
WORLDTIDES_API_KEY
AVIATIONSTACK_API_KEY
NAVITIA_API_KEY
DATABASE_URL
REDIS_URL
```

For production, secrets should be injected through the deployment platform or a dedicated secret-management system.

---

# 🧪 Testing

The project contains testing infrastructure for the frontend and gateway.

## Frontend

The root project includes Vitest/JSDOM dependencies for UI and logic testing.

A typical test workflow can include:

```text
Component test
      ↓
SDUI payload test
      ↓
API/service test
      ↓
Offline/fallback test
```

## Gateway

The gateway package exposes:

```bash
npm test
```

The configured test command uses gateway test files under `test/*.gateway.ts`.

Important scenarios to test include:

- Valid SDUI responses
- Invalid/unknown personas
- Location search
- Cache hits and misses
- Provider failures
- Missing optional API keys
- Route configuration
- Traveller requests
- Marine data
- Fallback behaviour

---

# ⚡ Offline & Failure-Resilient Behaviour

Mausam is designed so that a temporary dependency failure does not have to become a complete user-interface failure.

```text
                  Request
                     │
                     ▼
               Cache available?
                 /         \
               YES          NO
                │            │
                ▼            ▼
             Cached      Upstream APIs
             metrics          │
                │             ▼
                │        Normalize data
                │             │
                └──────┬──────┘
                       ▼
                  SDUI Engine
                       │
                       ▼
                    Client
```

This architecture provides a foundation for:

- Graceful degradation
- Cached weather snapshots
- Offline-aware UI states
- Provider failure isolation
- Deterministic development/demo mode

---

# 🧠 Why Server-Driven UI?

SDUI is especially useful when the application needs to evolve quickly without rebuilding every client for every information-priority change.

For example, the backend could decide that during a heavy-rain event:

```text
Normal homepage
├── Weather Hero
├── Forecast
├── Metrics
└── Advisory
```

becomes:

```text
Rain-event homepage
├── Severe Weather Alert
├── Weather Hero
├── Rain Advisory
├── Route/Traffic
└── Forecast
```

The client can reuse the same registered components while the server changes the composition.

---

# 🛡️ Defensive Architecture

A production-grade SDUI system must assume that server payloads can be malformed or incompatible.

Mausam's intended boundary is:

```text
                 SERVER
                   │
              JSON payload
                   │
                   ▼
             Client validator
                   │
             ┌─────┴─────┐
             │           │
          Valid       Invalid
             │           │
             ▼           ▼
       Component       Fallback
        Registry        State
             │
             ▼
        React Component
```

The server does **not** send executable React code. It sends structured data describing components and their properties.

---

# 📊 Data Normalization

External APIs all have different response formats. Mausam therefore uses an aggregation layer before generating the SDUI response.

```text
Open-Meteo Weather ───┐
                      │
Open-Meteo AQI ───────┤
                      │
Open-Meteo Marine ────┤
                      ├──► Data Aggregator ─► RawMetrics
TomTom Routing ───────┤                         │
                      │                         ▼
WorldTides ───────────┘                    SDUI Engine
                                                │
                                                ▼
                                           SDUI Payload
```

This means the UI does not need to understand the response schema of every upstream provider.

---

# 🎨 Personalization Examples

## 🌾 Farmer

The farmer homepage prioritizes:

```text
Rain chance
Soil moisture
Humidity
Temperature
UV
```

It can also provide guidance such as delaying spraying when rain probability is high or avoiding unnecessary irrigation when soil moisture is already elevated.

## 🎓 Student

The student homepage prioritizes:

```text
Traffic
Rain chance
Visibility
Temperature
Humidity
```

A route can be supplied to enable traffic-aware commute information.

## 🎣 Fisherman

The fisherman homepage can prioritize:

```text
Wave height
Water temperature
Humidity
Visibility
Rain
Tides
```

Marine conditions can also be summarized as Calm, Slight, Moderate or Rough.

## ❤️ Health

The health persona can prioritize:

```text
AQI
UV index
Pollen
Humidity
Visibility
```

The gateway can produce contextual environmental guidance based on the aggregated readings.

## ✈️ Traveller

The traveller experience can combine:

```text
Weather
Visibility
Rain
Route traffic
Flight / transit information
```

---

# 🧭 Development Workflow

A recommended local development setup is:

### Terminal 1 — Frontend

```bash
npm install
npm run dev
```

### Terminal 2 — SDUI Gateway

```bash
cd sdui-gateway
npm install
npm run dev
```

### Optional Terminal 3 — Infrastructure

```bash
cd sdui-gateway
docker compose up -d
```

Then configure:

```env
VITE_API_BASE_URL=http://localhost:4000
```

The resulting development flow is:

```text
Browser
   │
   ▼
Vite / React
   │
   │ HTTP
   ▼
Fastify SDUI Gateway :4000
   │
   ├── Open-Meteo
   ├── Open-Meteo AQI
   ├── Open-Meteo Marine
   ├── TomTom
   ├── WorldTides
   └── Travel providers
   │
   ▼
Redis / PostgreSQL cache
```

---

# 🧰 Useful Commands

## Frontend

```bash
npm install
npm run dev
npm run build
npm run preview
```

## SDUI Gateway

```bash
cd sdui-gateway
npm install
npm run dev
npm test
npm run db:generate
npm run db:migrate
```

## Infrastructure

```bash
cd sdui-gateway
docker compose up -d
docker compose down
```

---

# 📈 Roadmap

### Current / Core

- [x] React + TypeScript weather client
- [x] Persona-aware SDUI engine
- [x] Fastify SDUI gateway
- [x] Open-Meteo weather integration
- [x] Air-quality integration
- [x] Marine data integration
- [x] Location search integration
- [x] Optional route/traffic integration
- [x] Redis cache support
- [x] PostgreSQL weather snapshots
- [x] Travel-provider integration points
- [x] Weather alert backend infrastructure

### Next Improvements

- [ ] Strong runtime SDUI schema validation
- [ ] More comprehensive automated integration tests
- [ ] Production authentication and authorization
- [ ] API rate limiting
- [ ] Better observability and tracing
- [ ] Provider health monitoring
- [ ] More robust offline synchronization
- [ ] Real-time notification delivery
- [ ] Multilingual interface
- [ ] PWA/mobile client packaging
- [ ] React Native / Expo client
- [ ] Historical weather analytics
- [ ] AI-assisted weather recommendations
- [ ] More advanced agricultural advisories
- [ ] More advanced marine safety advisories
- [ ] SDUI experimentation/A-B testing

---

# 🎓 Academic & Project Context

### Project Title

**Mausam — Development of a Personalized Homepage for the “Mausam” Mobile Application**

### Major concepts demonstrated

- Server-Driven UI
- Personalized user experiences
- Component-based architecture
- React and TypeScript
- REST API integration
- Data aggregation and normalization
- Weather data processing
- Air-quality processing
- Marine weather processing
- Location services
- Route/traffic integration
- Caching
- Fault tolerance
- Offline-aware design
- Defensive rendering
- Event/alert infrastructure
- Backend integration

The project demonstrates how a real-world information platform can combine **data engineering, backend services and adaptive frontend architecture** rather than treating the weather screen as a static collection of cards.

---

# 🌟 Project Vision

Mausam aims to evolve from:

```text
A weather application
```

to:

```text
A personalized environmental intelligence platform
```

The long-term vision is:

```text
                USER
                 │
       ┌─────────┼─────────┐
       ▼         ▼         ▼
    Persona   Location   Context
       │         │         │
       └─────────┼─────────┘
                 ▼
           Data Aggregation
                 │
                 ▼
        Personalization Engine
                 │
                 ▼
             SDUI JSON
                 │
                 ▼
          Reusable UI System
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
     Weather   Alerts   Advisories
        │        │        │
        └────────┼────────┘
                 ▼
        Personalized Experience
```

> **Mausam — Weather that adapts to you.**

---

# 👨‍💻 Author

**Sreejoy Sarkar**

B.Tech — Computer Science / Cyber Security

Interests represented in this project include:

- Full-Stack Development
- Backend Development
- Modern Frontend Architecture
- API Integration
- AI/ML
- Cyber Security
- Cloud-oriented application design

---

# 📄 License

No explicit open-source license is currently declared in the repository.

Until a license is added, the code should be treated as **all rights reserved** rather than assumed to be freely reusable.

---

# ⭐ Final Summary

```text
                           🌦️ MAUSAM
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        Personalization     Live Data       Resilience
              │                │                │
              ▼                ▼                ▼
          Personas        Weather APIs     Cache/Fallback
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                         SDUI Gateway
                               │
                               ▼
                         SDUI JSON
                               │
                               ▼
                      Safe React Renderer
                               │
                               ▼
                   Personalized Homepage
```

<p align="center">
  <strong>🌦️ Mausam — Weather that adapts to you.</strong>
</p>
