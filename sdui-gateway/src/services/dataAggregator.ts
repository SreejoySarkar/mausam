export interface RawMetrics {
  aqi: number;
  trafficDelayMin: number;
  weatherTempC: number;
  timestamp: string;
}

export async function getAggregatedMetrics(lat: number, lon: number): Promise<RawMetrics> {
  // TODO(Member 4): replace with real cache + upstream API calls
  return {
    aqi: 82,
    trafficDelayMin: 14,
    weatherTempC: 29,
    timestamp: new Date().toISOString(),
  };
}