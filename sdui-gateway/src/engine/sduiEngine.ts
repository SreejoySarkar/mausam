import { RawMetrics } from '../services/dataAggregator';

export function generateSDUILayout(profile: string, metrics: RawMetrics) {
  // TODO(Member 3): real profile-based component tree logic
  return {
    type: 'column',
    children: [
      { type: 'card', title: 'Commute', body: `Delay: ${metrics.trafficDelayMin} min` },
      { type: 'card', title: 'Air Quality', body: `AQI: ${metrics.aqi}` },
    ],
  };
}