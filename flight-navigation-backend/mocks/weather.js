// Demo weather for mock mode, shaped like WeatherAPI.com's current.json response.
// A few stations are deliberately below the operating limits (visibility >= 1 km, wind <= 20 km/h)
// so every verdict can be demonstrated:
//   Vellore    fog          -> IXE to BLR via Chennai must reroute
//   Chittoor   strong wind  -> routes via Tirupati / Cuddapah must reroute
//   Hyderabad  thunderstorm -> landing at HYD must divert
const stations = {
  bangalore:      { lat: 12.98, lon: 77.58, text: "Partly cloudy", wind: 11, dir: "W",   vis: 10,  temp: 24, pressure: 1013, precip: 0,   humidity: 68, cloud: 40,  uv: 5, gust: 16 },
  mangalore:      { lat: 12.87, lon: 74.88, text: "Light rain",    wind: 14, dir: "WSW", vis: 6,   temp: 27, pressure: 1010, precip: 1.2, humidity: 84, cloud: 75,  uv: 3, gust: 21 },
  chennai:        { lat: 13.08, lon: 80.27, text: "Sunny",         wind: 16, dir: "SE",  vis: 10,  temp: 31, pressure: 1009, precip: 0,   humidity: 70, cloud: 10,  uv: 8, gust: 22 },
  coimbatore:     { lat: 11.0,  lon: 76.96, text: "Clear",         wind: 9,  dir: "W",   vis: 10,  temp: 26, pressure: 1012, precip: 0,   humidity: 60, cloud: 5,   uv: 7, gust: 13 },
  tirupati:       { lat: 13.63, lon: 79.42, text: "Hazy",          wind: 12, dir: "S",   vis: 4,   temp: 32, pressure: 1008, precip: 0,   humidity: 55, cloud: 20,  uv: 7, gust: 18 },
  cuddapah:       { lat: 14.47, lon: 78.82, text: "Sunny",         wind: 10, dir: "SW",  vis: 10,  temp: 33, pressure: 1008, precip: 0,   humidity: 45, cloud: 0,   uv: 8, gust: 15 },
  mysore:         { lat: 12.3,  lon: 76.65, text: "Partly cloudy", wind: 8,  dir: "W",   vis: 10,  temp: 25, pressure: 1013, precip: 0,   humidity: 65, cloud: 35,  uv: 6, gust: 12 },
  hyderabad:      { lat: 17.38, lon: 78.47, text: "Thundery outbreaks", wind: 42, dir: "NW", vis: 2, temp: 26, pressure: 1002, precip: 8.4, humidity: 91, cloud: 100, uv: 1, gust: 63 },
  vijayawada:     { lat: 16.52, lon: 80.62, text: "Cloudy",        wind: 13, dir: "E",   vis: 8,   temp: 30, pressure: 1006, precip: 0.2, humidity: 78, cloud: 80,  uv: 4, gust: 19 },
  chikkamagaluru: { lat: 13.32, lon: 75.77, text: "Mist",          wind: 7,  dir: "W",   vis: 3,   temp: 21, pressure: 1014, precip: 0.4, humidity: 92, cloud: 85,  uv: 2, gust: 11 },
  vellore:        { lat: 12.92, lon: 79.13, text: "Fog",           wind: 4,  dir: "NE",  vis: 0.6, temp: 23, pressure: 1011, precip: 0,   humidity: 97, cloud: 100, uv: 1, gust: 7 },
  chittoor:       { lat: 13.22, lon: 79.1,  text: "Strong wind",   wind: 31, dir: "SW",  vis: 9,   temp: 30, pressure: 1005, precip: 0,   humidity: 50, cloud: 30,  uv: 6, gust: 48 },
  udupi:          { lat: 13.34, lon: 74.75, text: "Light rain",    wind: 15, dir: "W",   vis: 7,   temp: 27, pressure: 1010, precip: 0.8, humidity: 86, cloud: 70,  uv: 3, gust: 22 },
  tumakuru:       { lat: 13.34, lon: 77.1,  text: "Partly cloudy", wind: 12, dir: "W",   vis: 10,  temp: 25, pressure: 1012, precip: 0,   humidity: 62, cloud: 30,  uv: 6, gust: 17 },
};

// Any other city gets steady, flyable weather derived from its name, so results are repeatable.
const fallback = (name) => {
  const h = [...name].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 9973, 7);
  return { lat: 0, lon: 0, text: "Partly cloudy", wind: 6 + (h % 10), dir: "W", vis: 8 + (h % 3), temp: 24 + (h % 8), pressure: 1008 + (h % 8), precip: 0, humidity: 55 + (h % 30), cloud: 20 + (h % 50), uv: 3 + (h % 5), gust: 10 + (h % 12) };
};

const pad = (n) => String(n).padStart(2, "0");
const nowStamp = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

function currentWeather(query) {
  const key = String(query || "").trim().toLowerCase();
  const s = stations[key] || fallback(key);
  return {
    location: { name: titleCase(key), lat: s.lat, lon: s.lon, country: "India" },
    current: {
      last_updated: nowStamp(),
      condition: { text: s.text },
      temp_c: s.temp,
      temp_f: Math.round((s.temp * 9) / 5 + 32),
      wind_kph: s.wind,
      wind_dir: s.dir,
      pressure_mb: s.pressure,
      pressure_in: Math.round(s.pressure * 0.02953 * 100) / 100,
      precip_mm: s.precip,
      precip_in: Math.round(s.precip * 0.03937 * 100) / 100,
      humidity: s.humidity,
      cloud: s.cloud,
      vis_km: s.vis,
      vis_miles: Math.round(s.vis * 0.621 * 10) / 10,
      uv: s.uv,
      gust_kph: s.gust,
      gust_mph: Math.round(s.gust * 0.621 * 10) / 10,
    },
  };
}

module.exports = { currentWeather };
