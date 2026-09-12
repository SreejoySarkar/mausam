# 🌦️ Mausam — Personalized Weather Platform

<p align="center">
  <strong>A personalized, resilient weather experience powered by Server-Driven UI</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/TanStack_Query-5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query 5">
  <img src="https://img.shields.io/badge/Zustand-5-443E38?style=for-the-badge" alt="Zustand 5">
</p>

<p align="center">
  <em>Weather information that adapts to the user, location, weather conditions and context.</em>
</p>

---

## 📌 Overview

**Mausam** is a modern weather platform focused on building a **personalized homepage for the Mausam application**.

Instead of presenting exactly the same weather dashboard to every user, Mausam uses **Server-Driven UI (SDUI)** principles to allow the backend to determine which weather modules, alerts, advisories and information should be prioritized for a particular user.

The project combines:

- 🌦️ Weather information
- 🧠 Persona-based personalization
- 🧩 Server-Driven UI
- 📍 Location search and coordinates
- 🌍 Global weather data
- ⚡ Offline/fallback behaviour
- 🛡️ Defensive rendering
- 🔔 Backend notification infrastructure
- 🌊 Marine weather information
- ☀️ Sunrise/sunset calculations
- 🌫️ Air-quality integration

The result is a weather experience that is designed to answer not only **"What is the weather?"**, but also **"What does this weather mean for this user?"**

---

# 🎯 Problem Statement

> **Development of Personalized Homepage for the “Mausam” Mobile Application**

A conventional weather application generally gives every user a similar set of cards. However, weather information has different value depending on the user's role and activity.

For example:

| User Persona | Important Information |
|---|---|
| 🌍 General User | Current weather, forecast and alerts |
| 🌾 Farmer | Rainfall, soil moisture, heat, wind and advisories |
| 🎓 Student | Temperature, rain probability and daily forecast |
| ✈️ Traveller | Temperature, precipitation, wind, visibility and alerts |
| 🎣 Fisherman | Wind, gusts, wave height, wave direction and marine conditions |
| 🥾 Outdoor User | UV, heat, rainfall and suitable activity windows |

Mausam addresses this requirement using a **persona-aware SDUI architecture**.

---

# 💡 Core Concept

The central architectural idea is:

> **The backend decides what information should be shown; the frontend decides how registered components should render it.**

Traditional UI:

```text
Frontend Code
     ↓
Fixed Page Layout
     ↓
Same Experience for Everyone
```

Mausam SDUI:

```text
User + Persona + Location + Weather
                 ↓
          Backend / SDUI Logic
                 ↓
             SDUI JSON
                 ↓
          Frontend Renderer
                 ↓
       Personalized Homepage
```

This separation makes the application easier to personalize, extend and evolve.

---

# ✨ Key Features

## 🧩 1. Server-Driven UI

Mausam uses a structured SDUI payload to describe the homepage.

The server can control:

- Which components appear
- Component ordering
- Weather information priority
- Persona-specific advisories
- Alerts and severity
- Visual atmosphere/theme

The frontend does not execute arbitrary server code. It maps known component types to safe, registered React components.

---

## 👤 2. Persona-Based Personalization

Mausam is designed around multiple user personas.

### 🌾 Farmer

Prioritizes information such as:

- Temperature
- Rain probability
- Wind
- Humidity
- Soil moisture
- Agricultural advisories

### 🎓 Student

Can prioritize:

- Current temperature
- Hourly forecast
- Rain probability
- Daily conditions
- Commute-oriented information

### ✈️ Traveller

Can prioritize:

- Temperature
- Rainfall
- Wind
- Visibility
- Forecast
- Weather alerts

### 🎣 Fisherman

Can prioritize:

- Wind speed
- Wind gusts
- Wave height
- Wave direction
- Wave period
- Marine alerts

### 🥾 Outdoor User

Can prioritize:

- Temperature
- UV index
- Rain probability
- Heat risk
- Wind

---

# 🌍 Weather Data Architecture

Mausam is designed to work with both **development/fallback weather data** and **live weather services**.

```text
                    Weather Request
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
       Preset / Fallback         Live Weather
            Data                    APIs
              │                       │
              └───────────┬───────────┘
                          ▼
                  Normalized Data
                          │
                          ▼
                    SDUI Payload
                          │
                          ▼
                     React UI
```

This separation is important because the frontend should not need to know where the weather information originated.

---

# ☁️ Open-Meteo Integration

Mausam integrates with **Open-Meteo** for weather and marine information.

The weather service can provide values such as:

- Current temperature
- Soil moisture
- Wind speed
- Hourly forecast
- Daily forecast
- Weather conditions
- Marine wave information

For location-based weather, coordinates are used as the primary input:

```text
Location
   ↓
Latitude + Longitude
   ↓
Open-Meteo
   ↓
Weather Data
   ↓
Data Processing
   ↓
Mausam Application
```

---

# 🌊 Marine Weather

Mausam's backend also includes a marine weather integration using the Open-Meteo Marine API.

Marine information includes:

- Wave height
- Wave direction
- Wave period

This is particularly useful for the **Fisherman** persona and demonstrates how persona-specific data sources can be incorporated into the same platform.

```text
Fisherman Persona
       ↓
Marine Data Required
       ↓
Wave + Wind Information
       ↓
Marine Advisory
       ↓
Personalized Homepage
```

---

# 🌱 Agricultural Weather

The backend weather integration also retrieves **soil moisture** information.

This creates an additional data source for agricultural-oriented personalization.

```text
Temperature
     +
Rain / Forecast
     +
Wind
     +
Soil Moisture
     ↓
Agricultural Weather Insight
```

A future production implementation can use this information to generate more sophisticated agricultural advisories.

---

# 🌫️ Air Quality Integration

The backend contains an integration point for the **World Air Quality Index (WAQI)** service.

This can provide air-quality information such as AQI and allow Mausam to eventually combine:

```text
Weather
   +
Air Quality
   +
User Persona
   ↓
Personalized Environmental Information
```

For example, an outdoor user could receive an air-quality-aware recommendation in addition to the normal weather forecast.

---

# ☀️ Sunrise & Sunset

Mausam's backend uses **SunCalc** to calculate astronomical information based on latitude and longitude.

```text
Latitude + Longitude
        ↓
     SunCalc
        ↓
 Sunrise / Sunset
```

This information can be used for:

- Day/night detection
- Weather themes
- User advisories
- Outdoor activity recommendations

---

# 🔔 Push Notification Infrastructure

The backend also contains Firebase Cloud Messaging integration points.

The intended architecture is:

```text
Weather Event / Alert
          ↓
    Mausam Backend
          ↓
 Firebase Cloud Messaging
          ↓
      User Device
          ↓
   Weather Notification
```

This provides a foundation for future features such as:

- Severe weather alerts
- Heavy rainfall notifications
- Marine warnings
- Personalized weather notifications

> Production notification tokens and Firebase service-account credentials must remain private and should never be committed to the repository.

---

# 🏗️ System Architecture

```text
                           ┌──────────────────────┐
                           │        USER          │
                           │ Persona + Location   │
                           └──────────┬───────────┘
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │   Mausam Frontend    │
                           │ React / TypeScript   │
                           └──────────┬───────────┘
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │     API / SDUI       │
                           │       Layer          │
                           └──────────┬───────────┘
                                      │
                     ┌────────────────┼────────────────┐
                     │                │                │
                     ▼                ▼                ▼
                Weather API       Marine API       AQI API
                     │                │                │
                     └────────────────┼────────────────┘
                                      │
                                      ▼
                              Data Processing
                                      │
                                      ▼
                                 SDUI Payload
                                      │
                                      ▼
                               SDUI Renderer
                                      │
                         ┌────────────┼────────────┐
                         ▼            ▼            ▼
                       Hero       Forecast     Advisory
                         │            │            │
                         └────────────┼────────────┘
                                      ▼
                            Personalized Homepage
```

---

# 🔄 SDUI Rendering Pipeline

The rendering process follows a controlled pipeline:

```text
SDUI JSON
   ↓
Payload Validation
   ↓
SDUI Renderer
   ↓
Component Registry
   ↓
Component Validation
   ↓
React Component
   ↓
Rendered Homepage
```

Example component mapping:

```text
WeatherHero
     ↓
WeatherHero Component

HourlyForecast
     ↓
HourlyForecast Component

DailyForecast
     ↓
DailyForecast Component

WeatherAlert
     ↓
Weather Alert Component

Advisory
     ↓
Advisory Component
```

Unknown or malformed components should be ignored rather than being allowed to break the complete page.

---

# 📦 Example SDUI Payload

A simplified SDUI response can look like:

```json
{
  "version": "1.0",
  "persona": "farmer",
  "location": {
    "city": "Kolkata",
    "state": "West Bengal",
    "lat": 22.5726,
    "lon": 88.3639
  },
  "theme": "monsoon",
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
      "id": "forecast",
      "type": "HourlyForecast",
      "props": {}
    },
    {
      "id": "advisory",
      "type": "Advisory",
      "props": {
        "title": "Agricultural Advisory"
      }
    }
  ]
}
```

The important point is that the backend supplies **data and composition**, while the frontend supplies the safe visual implementation.

---

# 🛡️ Defensive SDUI Design

Server-controlled payloads should always be treated as untrusted input.

Mausam follows a defensive rendering philosophy.

### Payload Validation

```text
Incoming JSON
     ↓
Validate Structure
     ↓
Valid? ── No ──► Reject / Fallback
  │
 Yes
  ↓
Render
```

### Component Whitelist

Only registered component types should be rendered.

The architecture avoids:

- `eval`
- Server-controlled JSX
- Arbitrary JavaScript execution
- Uncontrolled dynamic imports

### Error Isolation

A component failure should not bring down the entire homepage.

```text
Homepage
 ├── Hero        ✅
 ├── Forecast    ✅
 ├── Alert       ❌
 ├── Advisory    ✅
 └── Metrics     ✅

Result: Homepage continues to work.
```

---

# ⚡ Offline & Failure-Resilient Design

Weather applications should remain useful even when connectivity is unreliable.

Mausam is designed around fallback behaviour:

```text
                 Weather Request
                       │
                       ▼
                 Backend Available?
                    /       \
                  YES        NO
                   │          │
                   ▼          ▼
               Fresh Data   Cached /
                             Fallback Data
                   │          │
                   └────┬─────┘
                        ▼
                   SDUI Payload
                        ▼
                       UI
```

This approach allows the application to continue displaying useful information instead of immediately becoming a blank/error screen.

---

# 🧪 Backend Outage Simulation

For development and demonstrations, backend failure can be simulated conceptually as:

```text
Normal Mode
    ↓
Backend Request
    ↓
SDUI Response
    ↓
Render Homepage
```

and:

```text
Outage Simulation
    ↓
Backend Request Fails
    ↓
Fallback / Cached Data
    ↓
Render Available Information
    ↓
Show Offline / Stale State
```

This is useful for demonstrating **fault tolerance, graceful degradation and offline-first thinking**.

---

# 📍 Location Flow

The location pipeline can be represented as:

```text
User Search / Coordinates
          ↓
       Geocoding
          ↓
 Latitude + Longitude
          ↓
    Weather Request
          ↓
    Normalized Data
          ↓
    Persona Selection
          ↓
      SDUI Payload
          ↓
    Personalized UI
```

A location therefore becomes an input to the same personalization pipeline rather than requiring a separate page.

---

# 🧠 State Management

Mausam separates local application state from server-like state.

| Responsibility | Technology |
|---|---|
| Server / async state | TanStack Query |
| Local application state | Zustand |
| UI rendering | React |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Icons | Lucide React |
| Testing | Vitest + JSDOM |

### TanStack Query

Useful for:

- Fetching
- Caching
- Loading states
- Error states
- Refetching
- Retry behaviour
- Server-state lifecycle

### Zustand

Useful for lightweight application state such as:

- Selected persona
- Selected location
- Theme state
- Online/offline state
- Developer/demo controls

---

# 🎨 Dynamic Weather Experience

Mausam can use weather information to influence the visual atmosphere of the application.

Possible themes include:

```text
☀️ Clear / Heat
☁️ Cloud
🌧️ Monsoon
🌆 Dusk
🌊 Marine
🌙 Night
```

This creates a more immersive experience while keeping the underlying component structure reusable.

---

# 🧩 Component Architecture

The UI is organized around reusable components rather than a single large weather page.

Typical responsibilities include:

| Component | Purpose |
|---|---|
| `WeatherHero` | Main current-weather information |
| `HourlyForecast` | Hour-by-hour forecast |
| `DailyForecast` | Multi-day forecast |
| `WeatherAlert` | Weather warnings |
| `Advisory` | Persona-specific recommendations |
| `MetricsGrid` | Weather measurements |
| `LocationSection` | Location information |
| `HomeScreen` | Homepage orchestration |
| `SDUIRenderer` | Dynamic component rendering |
| Component Registry | Safe component lookup |

---

# 📂 Repository Structure

The repository contains both the client-side Mausam implementation and a backend integration area.

```text
mausam/
│
├── README.md
├── index.html
├── .gitignore
│
├── mausam_backend/
│   ├── package.json
│   ├── package-lock.json
│   │
│   └── src/
│       ├── firebaseAdmin.js
│       ├── testFCM.js
│       ├── testWeather.js
│       │
│       ├── services/
│       │   └── externalApiService.js
│       │
│       └── utils/
│           └── dataProcessor.js
│
└── frontend source / application modules
    ├── components/
    ├── services/
    ├── mock/
    ├── storage/
    ├── store/
    ├── types/
    ├── screens/
    └── tests/
```

> The exact frontend directory layout may evolve as the Mausam application is developed toward its final mobile/web architecture.

---

# 🛠️ Technology Stack

## Frontend

- **React 19**
- **TypeScript 5.9**
- **Vite 7**
- **Tailwind CSS 4**
- **TanStack Query 5**
- **Zustand 5**
- **Framer Motion**
- **Lucide React**

## Backend

The backend integration area currently uses:

- **Node.js**
- **CommonJS modules**
- **Axios**
- **dotenv**
- **Firebase Admin SDK**
- **SunCalc**

## External Services

- **Open-Meteo** — weather data
- **Open-Meteo Marine** — marine data
- **WAQI** — air-quality integration
- **Firebase Cloud Messaging** — push notification infrastructure

---

# 🚀 Getting Started

## Prerequisites

Install the following before running the project:

- Node.js
- npm
- Git

---

## Frontend Setup

If working with the frontend application:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## Backend Setup

Move into the backend directory:

```bash
cd mausam_backend
```

Install dependencies:

```bash
npm install
```

The backend integrations use environment variables for protected configuration.

Create a local `.env` file for values such as API tokens and other secrets.

**Never commit `.env` or Firebase service-account credentials to Git.**

---

# 🔐 Security Notes

The repository contains integrations involving external services and notification infrastructure. Sensitive credentials must remain outside the source code.

### Never commit:

```text
.env
firebase-service-account.json
API keys
private tokens
service credentials
```

Use environment variables instead:

```text
process.env.WAQI_TOKEN
process.env.MAPPLS_LICENSE_KEY
```

For production deployments, the recommended architecture is:

```text
Client
  ↓
Mausam Backend
  ↓
External Weather Services
```

rather than exposing sensitive service configuration directly to the client.

---

# 📊 Data Processing Pipeline

External API responses should not be passed directly into the UI.

Mausam's backend includes a processing layer:

```text
External API
     ↓
Raw Response
     ↓
Data Processor
     ↓
Normalized Data
     ↓
Application Logic
     ↓
SDUI / Client
```

For example:

```text
Open-Meteo
   ↓
Raw Weather Response
   ↓
processWeatherData()
   ↓
Temperature
Soil Moisture
Wind Speed
```

Similarly, marine data can be transformed into application-friendly values such as:

```text
Wave Height
Wave Direction
Wave Period
```

---

# 🧪 Testing Strategy

The project is designed to support testing at multiple levels.

### UI / Renderer Tests

Test:

- Valid SDUI payloads
- Invalid payloads
- Unknown components
- Component rendering
- Error boundaries

### Offline Tests

Test:

- Cached content
- Backend failure
- Fallback rendering
- Offline state
- Recovery after connectivity returns

### Backend Integration Tests

Test:

- Weather API responses
- Data processing
- Marine API responses
- AQI integration
- Sunrise/sunset calculation
- Notification infrastructure

---

# 🔄 Complete Application Flow

```text
                    USER
                      │
          ┌───────────┴───────────┐
          │                       │
       Persona                 Location
          │                       │
          └───────────┬───────────┘
                      ▼
              Weather Request
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
     Weather         Marine         AQI
       API             API           API
        │             │             │
        └─────────────┼─────────────┘
                      ▼
                Data Processing
                      │
                      ▼
               Personalization
                      │
                      ▼
                  SDUI JSON
                      │
                      ▼
               Payload Validation
                      │
                      ▼
               Component Registry
                      │
                      ▼
                React Components
                      │
                      ▼
              Personalized Homepage
```

---

# 🏭 Production Architecture

The long-term production architecture can evolve toward:

```text
                         ┌───────────────────┐
                         │   Mausam Client   │
                         │   Web / Mobile    │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │   API Gateway     │
                         │  Mausam Backend   │
                         └─────────┬─────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
             ▼                     ▼                     ▼
      Personalization        Weather Services       Notification
          Engine                   │                  Service
             │                     │                     │
             └─────────────────────┼─────────────────────┘
                                   ▼
                              SDUI Generator
                                   │
                                   ▼
                              JSON Response
                                   │
                                   ▼
                            Mausam Renderer
```

This architecture makes it possible to add new personas, weather providers and homepage modules without redesigning the entire client.

---

# 📈 Future Roadmap

- [ ] Production Node.js/Fastify API server
- [ ] Complete frontend/backend SDUI contract
- [ ] Persistent user profiles
- [ ] More user personas
- [ ] Advanced agricultural advisories
- [ ] Advanced marine advisories
- [ ] Real-time severe weather alerts
- [ ] Push notification scheduling
- [ ] Better offline caching
- [ ] PWA support
- [ ] React Native / Expo client
- [ ] Multilingual interface
- [ ] Voice-based weather queries
- [ ] AI-assisted weather recommendations
- [ ] Historical weather analytics
- [ ] Secure authentication
- [ ] Rate limiting and API protection
- [ ] Backend observability and monitoring
- [ ] SDUI A/B experimentation

---

# 🎓 Academic Context

### Project Title

**Mausam — Development of Personalized Homepage for the “Mausam” Mobile Application**

### Major Technical Concepts Demonstrated

- Server-Driven UI
- Component-based architecture
- React development
- TypeScript
- API integration
- Data normalization
- Personalization
- State management
- Offline-first design
- Fault tolerance
- Defensive rendering
- Weather data processing
- Marine data processing
- Air-quality integration
- Push notification infrastructure
- Responsive UI design

---

# 🌟 Why This Project Matters

Mausam demonstrates how a weather application can move beyond a static dashboard.

Instead of:

```text
One User
     ↓
One Fixed Dashboard
```

Mausam aims for:

```text
Different Users
      ↓
Different Needs
      ↓
Different Priorities
      ↓
Personalized SDUI
      ↓
One Reusable Frontend
```

This makes the architecture suitable for experimentation, personalization and future expansion.

---

# 👨‍💻 Author

**Sreejoy Sarkar**

B.Tech — Computer Science / Cyber Security

### Interests

- Software Development
- Full-Stack Development
- Cyber Security
- AI/ML
- Backend Development
- Modern Frontend Architecture
- Cloud & API Integration

---

# 📄 License

This project is primarily developed for **academic, learning and demonstration purposes**.

If the project is later released for public reuse, an appropriate open-source license should be added to the repository.

---

# ⭐ Project Summary

```text
                         🌦️ MAUSAM
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        Personalization   Live Data       Resilience
              │              │              │
              ▼              ▼              ▼
             Persona      Weather APIs    Offline/Fallback
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                           SDUI
                             │
                             ▼
                    Personalized Weather
                         Experience
```

> **Mausam — Weather that adapts to you.**
..

