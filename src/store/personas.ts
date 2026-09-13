import type { PersonaId } from "../types/sdui";

export interface PersonaMeta {
  id: PersonaId;
  label: string;
  tagline: string;
  icon: string; // whitelisted icon name
  accent: string;
}

/** Display metadata owned by the frontend; persona *content* comes from SDUI. */
export const PERSONAS: PersonaMeta[] = [
  { id: "general", label: "General", tagline: "Everyday weather", icon: "User", accent: "#fda4af" },
  { id: "farmer", label: "Farmer", tagline: "Agri advisories & rainfall", icon: "Sprout", accent: "#6ee7b7" },
  { id: "student", label: "Student", tagline: "Commute-first briefs", icon: "GraduationCap", accent: "#7dd3fc" },
  { id: "traveller", label: "Traveller", tagline: "Trip planning windows", icon: "Plane", accent: "#c4b5fd" },
  { id: "fisherman", label: "Fisherman", tagline: "Wind, waves & tides", icon: "Fish", accent: "#67e8f9" },
  { id: "outdoor", label: "Outdoor Worker", tagline: "Heat & lightning safety", icon: "HardHat", accent: "#fcd34d" },
  { id: "health", label: "Health", tagline: "AQI, UV & sensitivity care", icon: "HeartPulse", accent: "#fb7185" },
  { id: "parent", label: "Parent", tagline: "School commute & safety", icon: "Users", accent: "#fbbf24" },
  { id: "event", label: "Event Planner", tagline: "Comfort & outdoor windows", icon: "CalendarDays", accent: "#a78bfa" },
];

export function personaMeta(id: PersonaId): PersonaMeta {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];
}
