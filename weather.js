import { setSettings } from "./storage.js";

const GEO_IP_URL = "https://api.ip.sb/geoip";
const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Dense drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

export function describeWeatherCode(code) {
  return WEATHER_CODES[code] || "Unknown conditions";
}

async function geocode(query) {
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  const match = data.results && data.results[0];
  if (!match) return null;
  const label = [match.name, match.admin1 || match.country].filter(Boolean).join(", ");
  return { label, lat: match.latitude, lon: match.longitude };
}

// Auto-detect: ip.sb's geoip response already includes latitude/longitude,
// so this uses those directly instead of building a "City, Region, Country"
// string and asking Open-Meteo's geocoder to resolve it back to coordinates
// - that extra round trip was a real failure point (a query the geocoder
// couldn't match killed the whole thing on first launch) and was never
// actually necessary here. Geocoding text is still the right tool for the
// manual "type a city" path below, where turning free text into coordinates
// is the entire point.
export async function detectLocation() {
  const res = await fetch(GEO_IP_URL);
  const data = await res.json();
  if (data.latitude == null || data.longitude == null) {
    throw new Error("IP geolocation did not return coordinates");
  }
  const label = [data.city, data.region || data.country].filter(Boolean).join(", ");
  const resolved = { label, lat: data.latitude, lon: data.longitude };
  await setSettings({
    location: resolved.label,
    locationLat: resolved.lat,
    locationLon: resolved.lon,
  });
  return resolved;
}

export async function setManualLocation(cityName) {
  const resolved = await geocode(cityName);
  if (!resolved) throw new Error("Could not find that location");
  await setSettings({
    location: resolved.label,
    locationLat: resolved.lat,
    locationLon: resolved.lon,
  });
  return resolved;
}

export async function fetchWeather(lat, lon, unit) {
  const temperatureUnit = unit === "c" ? "celsius" : "fahrenheit";
  const url = `${FORECAST_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code&temperature_unit=${temperatureUnit}`;
  const res = await fetch(url);
  const data = await res.json();
  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    weatherCode: data.current.weather_code,
    unitSymbol: unit === "c" ? "°C" : "°F",
  };
}
