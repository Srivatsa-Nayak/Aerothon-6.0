// Operating limits, matching checkWeatherConditions in the backend's server.js.
export const MIN_VISIBILITY_KM = 1.0;
export const MAX_WIND_KPH = 20.0;

// Returns { ok, reasons } for a weather object from /api/getlocation.
export function assessWeather(weather) {
  const reasons = [];
  if (weather.visibility.km < MIN_VISIBILITY_KM) {
    reasons.push(`Visibility ${weather.visibility.km} km, below the ${MIN_VISIBILITY_KM} km minimum`);
  }
  if (weather.wind.speed > MAX_WIND_KPH) {
    reasons.push(`Wind ${weather.wind.speed} km/h, above the ${MAX_WIND_KPH} km/h limit`);
  }
  return { ok: reasons.length === 0, reasons };
}
