import assert from 'node:assert/strict';
import test from 'node:test';
import { generateSDUILayout } from '../src/engine/sduiEngine';
import type { RawMetrics } from '../src/services/dataAggregator';

const location = { id: 'kolkata', city: 'Kolkata', state: 'West Bengal', label: 'Kolkata, West Bengal', lat: 22.57, lon: 88.36 };
const metrics: RawMetrics = {
  aqi: 92, weatherTempC: 31, humidityPct: 72, uvIndex: 7, visibilityKm: 8, rainChancePct: 45,
  soilMoisture: 0.31, sunrise: null, sunset: null, waveHeightM: null, waveDirectionDeg: null,
  wavePeriodS: null, waterTemperatureC: null, tides: [], traffic: null, routeConfigured: false,
  pollen: null, hourly: [{ t: 'Now', icon: 'CloudSun', temp: 31, precip: 45 }],
  daily: [{ d: 'Today', icon: 'CloudSun', hi: 33, lo: 26, precip: 45 }], timestamp: '2026-09-12T00:00:00.000Z',
};

function component(payload: ReturnType<typeof generateSDUILayout>, type: string) {
  return payload.components.find((node) => node.type === type)?.props as Record<string, any> | undefined;
}

test('parent persona prioritizes family conditions', () => {
  const payload = generateSDUILayout('parent', metrics, location);
  const advisory = component(payload, 'Advisory');
  const metricGrid = component(payload, 'MetricsGrid');
  assert.equal(payload.persona, 'parent');
  assert.equal(advisory?.title, 'Family brief');
  assert.deepEqual(advisory?.items.map((item: { title: string }) => item.title), ['School commute', 'Visibility', 'Heat safety', 'Severe weather']);
  assert.equal(metricGrid?.title, 'Family conditions');
});

test('event persona exposes comfort planning guidance', () => {
  const payload = generateSDUILayout('event', metrics, location);
  const advisory = component(payload, 'Advisory');
  assert.equal(payload.persona, 'event');
  assert.equal(advisory?.title, 'Event planner');
  assert.equal(advisory?.items[0]?.title, 'Comfort index');
  assert.match(advisory?.items[0]?.body, /Outdoor comfort is/);
});

test('student persona distinguishes an unsaved route', () => {
  const payload = generateSDUILayout('student', metrics, location);
  const metricGrid = component(payload, 'MetricsGrid');
  const traffic = metricGrid?.metrics.find((metric: { label: string }) => metric.label === 'Traffic');
  assert.equal(traffic?.value, 'Set route');
  assert.equal(traffic?.sub, 'Choose a commute destination');
});

test('student persona reports traffic delay when route data exists', () => {
  const payload = generateSDUILayout('student', { ...metrics, routeConfigured: true, traffic: { delayMin: 6, travelMin: 1100, freeFlowMin: 1094 } }, location);
  const metricGrid = component(payload, 'MetricsGrid');
  const traffic = metricGrid?.metrics.find((metric: { label: string }) => metric.label === 'Traffic');
  assert.equal(traffic?.value, '6');
  assert.equal(traffic?.unit, 'min');
});
