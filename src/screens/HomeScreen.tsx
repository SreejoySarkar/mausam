/**
 * Mausam Home — the offline-first SDUI boot flow:
 *
 *   1. app launch
 *   2. synchronously read cached SDUI payload from MMKV-style storage
 *   3. render cached UI immediately (never a blank screen)
 *   4. skeleton only when no cache exists
 *   5. TanStack Query fetches the backend SDUI payload in the background
 *   6. fresh payload is validated + persisted to MMKV
 *   7. SDUIRenderer resolves it via the Component Registry
 *   8. API failure -> keep cached UI + subtle stale banner + retry
 */
import { useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getSDUIHome } from "../services/api";
import { readCachedSDUI, writeCachedSDUI } from "../storage/mmkv";
import { useAppStore } from "../store/useAppStore";
import { isValidPayload } from "../types/sdui";
import { formatAgo } from "../lib/format";
import { SDUIRenderer } from "../sdui/SDUIRenderer";
import { AppHeader } from "../components/chrome/AppHeader";
import { OfflineBanner } from "../components/states/OfflineBanner";
import { HomeSkeleton } from "../components/states/HomeSkeleton";
import { ErrorState } from "../components/states/ErrorState";

export function HomeScreen() {
  const persona = useAppStore((s) => s.persona);
  const location = useAppStore((s) => s.location);
  const online = useAppStore((s) => s.online);
  const forceOffline = useAppStore((s) => s.forceOffline);
  const setTheme = useAppStore((s) => s.setTheme);
  const setOnline = useAppStore((s) => s.setOnline);

  /* connectivity listeners */
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, [setOnline]);

  /* step 2–3: synchronous cache read (MMKV semantics) — zero async gap */
  const cached = useMemo(() => readCachedSDUI(persona, location.id), [persona, location.id]);

  /* step 5: server state owned by TanStack Query, keyed by persona+location */
  const query = useQuery({
    queryKey: ["sdui-home", persona, location.id],
    queryFn: ({ signal }) => getSDUIHome(persona, location, signal),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 1,
    retryDelay: 1_400,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  /* step 6–7: validate + persist fresh payloads to the MMKV cache */
  useEffect(() => {
    if (isValidPayload(query.data)) {
      writeCachedSDUI(persona, location.id, query.data);
    }
  }, [query.data, persona, location.id]);

  /* auto-recover when connectivity returns */
  useEffect(() => {
    if (online && !forceOffline && query.isError) void query.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online, forceOffline]);

  const payload = isValidPayload(query.data) ? query.data : cached?.payload ?? null;

  /* atmosphere follows the payload's theme */
  useEffect(() => {
    if (payload) setTheme(payload.theme);
  }, [payload, setTheme]);

  const showSkeleton = !payload && query.isPending;
  const hardError = !payload && query.isError;
  const stale = !!payload && (query.isError || !online || forceOffline);
  const lastSync = query.dataUpdatedAt || cached?.savedAt;

  const retry = () => void query.refetch();

  return (
    <>
      <AppHeader locationLabel={payload?.location.label ?? location.label} syncing={query.isFetching} onRetry={retry} />

      <main className="scrollbar-hide relative z-20 flex-1 overflow-y-auto overscroll-contain px-5 pb-12">
        <AnimatePresence>
          {stale && <OfflineBanner key="offline" savedAt={lastSync} retrying={query.isFetching} onRetry={retry} />}
        </AnimatePresence>

        {showSkeleton && <HomeSkeleton />}
        {hardError && <ErrorState retrying={query.isFetching} onRetry={retry} />}
        {payload && (
          <>
            <SDUIRenderer payload={payload} />
            <footer className="mt-6 px-2 text-center">
              <p className="text-[10.5px] leading-relaxed text-white/30">
                SDUI v{payload.version} · {payload.components.length} server-driven components
                <br />
                Generated {formatAgo(payload.generatedAt)} · no layout hardcoded on-device
              </p>
            </footer>
          </>
        )}
        <div className="h-4" />
      </main>
    </>
  );
}
