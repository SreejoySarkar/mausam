import { useEffect, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HomeScreen } from "./screens/HomeScreen";
import { Backdrop } from "./components/chrome/Backdrop";
import { StatusBar } from "./components/chrome/StatusBar";
import { PersonaSheet } from "./components/chrome/PersonaSheet";
import { LocationSheet } from "./components/chrome/LocationSheet";
import { CommuteSheet } from "./components/chrome/CommuteSheet";
import { TravelSheet } from "./components/chrome/TravelSheet";
import { useAppStore } from "./store/useAppStore";
import { ATMOSPHERE } from "./lib/theme";
import { reverseGeocode } from "./services/openMeteo";
import { readLocation } from "./storage/mmkv";

function Stage() {
  const theme = useAppStore((s) => s.theme);
  const atmo = ATMOSPHERE[theme];
  const setLocation = useAppStore((s) => s.setLocation);
  const pushRecentLocation = useAppStore((s) => s.pushRecentLocation);

  useEffect(() => {
    if (readLocation() || !navigator.geolocation) return;
    try {
      if (window.sessionStorage.getItem("mausam.location-detection-attempted")) return;
      window.sessionStorage.setItem("mausam.location-detection-attempted", "1");
    } catch {
      // Best effort only; location detection must never block the homepage.
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const city = (await reverseGeocode(coords.latitude, coords.longitude)) ?? "Current location";
        const location = {
          id: `gps-${coords.latitude.toFixed(3)}-${coords.longitude.toFixed(3)}`,
          city,
          state: "",
          label: city === "Current location" ? city : `${city} (GPS)`,
          lat: coords.latitude,
          lon: coords.longitude,
        };
        setLocation(location);
        pushRecentLocation(location);
      },
      () => {
        // The preset remains active when permission is denied or GPS is unavailable.
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 }
    );
  }, [pushRecentLocation, setLocation]);

  return (
    <div className="relative flex h-dvh items-center justify-center overflow-hidden">
      {/* ambient page backdrop for large screens (follows app theme) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-colors duration-1000"
        style={{
          background: `
            radial-gradient(60% 50% at 15% 10%, ${atmo.orbA} 0%, transparent 70%),
            radial-gradient(55% 45% at 85% 90%, ${atmo.orbB} 0%, transparent 70%),
            #04060b`,
        }}
      />

      {/* device frame — full-bleed on phones, framed handset on desktop */}
      <div className="relative z-10 flex h-dvh w-full flex-col overflow-hidden bg-[#070a12] sm:h-[min(920px,94dvh)] sm:max-w-[400px] sm:rounded-[48px] sm:border sm:border-white/12 sm:shadow-[0_60px_120px_-40px_rgba(0,0,0,0.85)]">
        <Backdrop />
        <StatusBar />
        <HomeScreen />
        <PersonaSheet />
        <LocationSheet />
        <CommuteSheet />
        <TravelSheet />
      </div>

      {/* desktop caption */}
      <div className="pointer-events-none absolute bottom-6 left-8 z-10 hidden lg:block">
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-white/25">Mausam</p>
        <p className="mt-1 max-w-[260px] text-[11.5px] leading-relaxed text-white/30">
          Server-driven personalized weather — TanStack Query, Zustand, MMKV cache, component registry.
        </p>
      </div>
      <div className="pointer-events-none absolute right-8 top-6 z-10 hidden text-right lg:block">
        <p className="tnum text-[11px] font-medium tracking-wide text-white/25">offline-first · SDUI v1.0</p>
      </div>
    </div>
  );
}

export default function App() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            structuralSharing: true,
            networkMode: "always",
          },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Stage />
    </QueryClientProvider>
  );
}
