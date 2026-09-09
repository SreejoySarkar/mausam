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
import { isValidPayload, type LocationMeta, type PersonaId, type SDUIPayload } from "../types/sdui";

/* ---------------------------------------------------------------------
 * PRODUCTION TRANSPORT (Node.js / Fastify)
 * ---------------------------------------------------------------------
 * import axios from "axios";
 *
 * const http = axios.create({ baseURL: API_BASE_URL, timeout: 10_000 });
 *
 * export async function getSDUIHome(persona: PersonaId, locationId: string) {
 *   const { data } = await http.get("/v1/home", { params: { persona, location: locationId } });
 *   if (!isValidPayload(data)) throw new Error("Invalid SDUI payload");
 *   return data;
 * }
 * -------------------------------------------------------------------- */

function isOffline(): boolean {
  const { forceOffline, online } = useAppStore.getState();
  return forceOffline || !online;
}

/** Production: GET /v1/home?persona=&lat=&lon=&place= */
export async function getSDUIHome(persona: PersonaId, location: LocationMeta, signal?: AbortSignal): Promise<SDUIPayload> {
  const data = await mockFetchHome(persona, location, isOffline(), signal);
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
