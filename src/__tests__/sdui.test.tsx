/**
 * SDUI engine tests — registry resolution, prop validation, renderer
 * resilience against malformed payloads, and payload guards.
 * Run with: npx vitest run
 */
import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { SDUIRenderer } from "../sdui/SDUIRenderer";
import { COMPONENT_REGISTRY, resolveComponent } from "../sdui/registry";
import { isValidPayload, type SDUIPayload } from "../types/sdui";
import { mockFetchHome } from "../mock/backend";

const heroProps = {
  temperature: 31,
  feelsLike: 36,
  condition: "Partly Cloudy",
  icon: "CloudSun",
  hi: 33,
  lo: 26,
  locationLabel: "Kolkata, West Bengal",
  summary: "Warm and humid.",
  stats: [{ icon: "Wind", label: "Wind", value: "14 km/h" }],
};

describe("ComponentRegistry", () => {
  it("resolves every supported component type", () => {
    for (const type of ["WeatherHero", "HourlyForecast", "DailyForecast", "WeatherAlert", "Advisory", "MetricsGrid", "LocationSection"]) {
      expect(resolveComponent(type), type).toBeTruthy();
    }
  });

  it("gracefully returns null for unsupported/injected types", () => {
    expect(resolveComponent("script")).toBeNull();
    expect(resolveComponent("__proto__")).toBeNull();
    expect(resolveComponent("ExperimentalWidget9000")).toBeNull();
  });

  it("validators reject malformed props and accept valid ones", () => {
    expect(COMPONENT_REGISTRY.WeatherHero.validate?.({})).toBe(false);
    expect(COMPONENT_REGISTRY.WeatherHero.validate?.(heroProps)).toBe(true);
    expect(COMPONENT_REGISTRY.WeatherAlert.validate?.({ title: "Storm" })).toBe(false); // missing severity
    expect(COMPONENT_REGISTRY.HourlyForecast.validate?.({ hours: "nope" })).toBe(false);
  });
});

describe("SDUIRenderer", () => {
  const payload = {
    version: "1.0",
    persona: "general",
    location: { id: "kolkata", city: "Kolkata", state: "WB", label: "Kolkata", lat: 22.5, lon: 88.3 },
    theme: "cloud",
    generatedAt: new Date().toISOString(),
    components: [
      { id: "hero", type: "WeatherHero", props: heroProps },
      { id: "x", type: "UnknownBackendWidget", props: {} },
      null,
      { id: "bad", type: "WeatherAlert", props: { wrong: true } },
    ],
  } as unknown as SDUIPayload;

  it("renders valid nodes and skips unknown/malformed ones without crashing", () => {
    const html = renderToString(<SDUIRenderer payload={payload} />);
    expect(html).toContain("Partly Cloudy");
    expect(html).toContain("Kolkata");
  });

  it("survives a completely malformed payload", () => {
    expect(() => renderToString(<SDUIRenderer payload={{} as SDUIPayload} />)).not.toThrow();
    expect(() =>
      renderToString(<SDUIRenderer payload={{ components: [null, 42, { type: 7 }] } as unknown as SDUIPayload} />)
    ).not.toThrow();
  });
});

describe("payload validation + mock backend", () => {
  it("accepts the backend payload shape and rejects garbage", async () => {
    const p = await mockFetchHome("farmer", "kolkata", false);
    expect(isValidPayload(p)).toBe(true);
    expect(isValidPayload(null)).toBe(false);
    expect(isValidPayload({ version: 1, components: {} })).toBe(false);
  });

  it("produces different layout/content per persona", async () => {
    const farmer = await mockFetchHome("farmer", "kolkata", false);
    const fisherman = await mockFetchHome("fisherman", "kolkata", false);
    const farmerTypes = farmer.components.map((c) => c.type).join(",");
    const fishermanTypes = fisherman.components.map((c) => c.type).join(",");
    expect(farmer.persona).toBe("farmer");
    expect(farmerTypes).not.toEqual(fishermanTypes); // backend controls order & visibility
    expect(fisherman.components.some((c) => c.type === "WeatherAlert")).toBe(true); // marine warning
  });

  it("API failure path rejects with a typed OFFLINE error", async () => {
    await expect(mockFetchHome("general", "kolkata", true)).rejects.toMatchObject({ code: "OFFLINE" });
  });
});
