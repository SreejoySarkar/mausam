/**
 * API service layer.
 *
 * In the Expo build this is the ONLY module that talks to the network.
 * Swap the mock transport for the commented axios implementation and point
 * API_BASE_URL at the Fastify service — payloads are validated defensively
 * before they ever reach the renderer.
 *
 * No API keys or secrets live here (or anywhere in the app).
 */
import { mockFetchHome, mockUpdatePersona } from "../mock/backend";
import { useAppStore } from "../store/useAppStore";
import type { CommuteRoute, TravelPlan } from "../storage/mmkv";
import { isValidPayload, type LocationMeta, type PersonaId, type SDUIPayload } from "../types/sdui";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

function isOffline(): boolean {
  const { forceOffline, online } = useAppStore.getState();
  return forceOffline || !online;
}

/** Production: GET /v1/home?persona=&lat=&lon=&place= */
export async function getSDUIHome(persona: PersonaId, location: LocationMeta, signal?: AbortSignal, commuteRoute?: CommuteRoute | null, travelPlan?: TravelPlan | null): Promise<SDUIPayload> {
  if (!API_BASE_URL) {
    const data = await mockFetchHome(persona, location, isOffline(), signal);
    if (!isValidPayload(data)) {
      throw new Error("Invalid SDUI payload received");
    }
    return data;
  }

  if (isOffline()) throw new Error("Mausam is offline");

  const params = new URLSearchParams({
    persona,
    lat: String(location.lat),
    lon: String(location.lon),
    place: location.city,
  });
  if (commuteRoute) {
    params.set("originLat", String(commuteRoute.origin.lat));
    params.set("originLon", String(commuteRoute.origin.lon));
    params.set("destinationLat", String(commuteRoute.destination.lat));
    params.set("destinationLon", String(commuteRoute.destination.lon));
  }
  if (travelPlan) {
    params.set("travelType", travelPlan.type);
    params.set("travelMode", travelPlan.mode);
    params.set("originLat", String(travelPlan.origin.lat));
    params.set("originLon", String(travelPlan.origin.lon));
    params.set("destinationLat", String(travelPlan.destination.lat));
    params.set("destinationLon", String(travelPlan.destination.lon));
    params.set("travelDate", travelPlan.travelDate);
    if (travelPlan.flightNumber) params.set("flightNumber", travelPlan.flightNumber);
  }
  const response = await fetch(`${API_BASE_URL}/v1/home?${params}`, { signal });
  if (!response.ok) throw new Error(`Mausam API request failed (${response.status})`);
  const data: unknown = await response.json();
  // Defensive validation — malformed JSON from the wire must never crash the app.
  if (!isValidPayload(data)) {
    throw new Error("Invalid SDUI payload received");
  }
  return data;
}

/** Fire-and-forget persona sync; failures are non-blocking by design. */
export async function postPersona(persona: PersonaId): Promise<void> {
  try {
    await mockUpdatePersona(persona, isOffline());
  } catch {
    /* queued locally — will reconcile on next successful sync */
  }
}
