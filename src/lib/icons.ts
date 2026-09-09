/**
 * Whitelisted icon resolver.
 *
 * The backend may only reference icon *names* from this map — SDUI JSON can
 * never reference or execute arbitrary frontend code. Unknown names resolve
 * to a neutral fallback instead of crashing.
 */
import {
  Anchor,
  AlertTriangle,
  Backpack,
  Bike,
  Bug,
  Bus,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Cloudy,
  Droplets,
  Eye,
  Fish,
  GraduationCap,
  HardHat,
  Leaf,
  Luggage,
  MapPin,
  Moon,
  Navigation,
  Plane,
  Shirt,
  Sparkles,
  Sprout,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  ThermometerSun,
  Umbrella,
  User,
  Waves,
  Wheat,
  Wind,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  // weather glyphs
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  Cloudy,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  CloudHail,
  CloudSnow,
  // metrics
  Wind,
  Droplets,
  Waves,
  Thermometer,
  ThermometerSun,
  Eye,
  Sunrise,
  Sunset,
  Navigation,
  Umbrella,
  Anchor,
  // personas / advisories
  User,
  Sprout,
  Wheat,
  Bug,
  Leaf,
  GraduationCap,
  Backpack,
  Bus,
  Bike,
  Plane,
  Luggage,
  Fish,
  HardHat,
  Shirt,
  Sparkles,
  // system
  MapPin,
  AlertTriangle,
};

export function resolveIcon(name: string | undefined): LucideIcon {
  if (name && MAP[name]) return MAP[name];
  return Cloud;
}

export { MAP as ICON_WHITELIST };
