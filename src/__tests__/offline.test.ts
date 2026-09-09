// @vitest-environment jsdom
/**
 * Offline-first tests — MMKV-style cache round-trips, corruption handling,
 * persona persistence, and store-driven persona switching.
 * Run with: npx vitest run
 */
import { beforeEach, describe, expect, it } from "vitest";
import { mockFetchHome } from "../mock/backend";
import { readCachedSDUI, readPersona, storage, writeCachedSDUI, writePersona } from "../storage/mmkv";
import { useAppStore } from "../store/useAppStore";
import type { SDUIPayload } from "../types/sdui";

describe("MMKV cache (boot flow)", () => {
  beforeEach(() => window.localStorage.clear());

  it("round-trips a successful SDUI payload (launch -> instant cached render)", async () => {
    const payload = await mockFetchHome("student", "delhi", false);
    writeCachedSDUI("student", "delhi", payload);
    const cached = readCachedSDUI("student", "delhi");
    expect(cached).not.toBeNull();
    expect(cached?.payload.persona).toBe("student");
    expect(cached?.payload.components.length).toBeGreaterThan(3);
    expect(typeof cached?.savedAt).toBe("number");
  });

  it("treats corrupted JSON as a cache miss (never crashes)", () => {
    storage.set("sdui:general:kolkata", "{corrupted-json");
    expect(readCachedSDUI("general", "kolkata")).toBeNull();
  });

  it("refuses to persist/read shapeless payloads", () => {
    writeCachedSDUI("general", "kolkata", { junk: true } as unknown as SDUIPayload);
    expect(readCachedSDUI("general", "kolkata")).toBeNull();
  });

  it("keeps caches isolated per persona + location", async () => {
    const a = await mockFetchHome("farmer", "kolkata", false);
    const b = await mockFetchHome("farmer", "mumbai", false);
    writeCachedSDUI("farmer", "kolkata", a);
    writeCachedSDUI("farmer", "mumbai", b);
    expect(readCachedSDUI("farmer", "kolkata")?.payload.location.id).toBe("kolkata");
    expect(readCachedSDUI("farmer", "mumbai")?.payload.location.id).toBe("mumbai");
    expect(readCachedSDUI("traveller", "kolkata")).toBeNull();
  });
});

describe("persona switching (local state)", () => {
  beforeEach(() => window.localStorage.clear());

  it("persists + validates the selected persona", () => {
    expect(readPersona()).toBeNull();
    writePersona("fisherman");
    expect(readPersona()).toBe("fisherman");
    storage.set("persona", "not-a-persona");
    expect(readPersona()).toBeNull();
  });

  it("store persona switch updates state and MMKV synchronously", () => {
    useAppStore.getState().setPersona("farmer");
    expect(useAppStore.getState().persona).toBe("farmer");
    expect(readPersona()).toBe("farmer");
    const place = { id: "geo-42", city: "Pune", state: "Maharashtra", label: "Pune, Maharashtra", lat: 18.52, lon: 73.86 };
    useAppStore.getState().setLocation(place);
    expect(useAppStore.getState().location.id).toBe("geo-42");
    useAppStore.getState().pushRecentLocation(place);
    expect(useAppStore.getState().recentLocations[0]?.id).toBe("geo-42");
  });

  it("offline simulation flag is local UI state", () => {
    expect(useAppStore.getState().forceOffline).toBe(false);
    useAppStore.getState().setForceOffline(true);
    expect(useAppStore.getState().forceOffline).toBe(true);
    useAppStore.getState().setForceOffline(false);
  });
});
