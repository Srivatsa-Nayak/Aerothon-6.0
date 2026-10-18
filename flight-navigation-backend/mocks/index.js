// Mock mode: answers every outbound axios request from local demo data, so the app
// runs with no third-party API keys. Enabled by MOCK_EXTERNAL_APIS=true in .env.
const { AxiosError } = require("axios");
const { airports, byIata, haversineKm } = require("./airports");
const { currentWeather } = require("./weather");

const TIMEZONE = "Asia/Kolkata";

const airportgapAirport = (a) => ({
  id: a.iata,
  name: a.name,
  city: a.city,
  country: "India",
  iata: a.iata,
  icao: a.icao,
  latitude: String(a.lat),
  longitude: String(a.lon),
  altitude: a.altitude,
  timezone: TIMEZONE,
});

const ok = (config, data) => ({ data, status: 200, statusText: "OK", headers: {}, config, request: {} });

const fail = (config, status, data) => {
  const response = { data, status, statusText: "Error", headers: {}, config, request: {} };
  throw new AxiosError(`Request failed with status code ${status}`, AxiosError.ERR_BAD_REQUEST, config, {}, response);
};

// Merges query-string, `params` and body fields into one lookup.
function readInputs(config) {
  const url = new URL(config.url);
  const inputs = Object.fromEntries(url.searchParams);
  Object.assign(inputs, config.params || {});
  let body = config.data;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = Object.fromEntries(new URLSearchParams(body));
    }
  } else if (body instanceof URLSearchParams) {
    body = Object.fromEntries(body);
  }
  if (body && typeof body === "object") Object.assign(inputs, body);
  return { url, inputs };
}

const handlers = [
  {
    match: (url) => url.hostname === "api.weatherapi.com",
    handle: (config, { inputs }) => ok(config, currentWeather(inputs.q)),
  },
  {
    match: (url) => url.hostname === "test.api.amadeus.com" && url.pathname.endsWith("/oauth2/token"),
    handle: (config) => ok(config, { access_token: "mock-token", token_type: "Bearer", expires_in: 1799 }),
  },
  {
    // Airports within `radius` km of a point, nearest first, Amadeus-shaped
    match: (url) => url.hostname === "test.api.amadeus.com" && url.pathname.endsWith("/locations/airports"),
    handle: (config, { inputs }) => {
      const lat = parseFloat(inputs.latitude);
      const lon = parseFloat(inputs.longitude);
      const radius = parseFloat(inputs.radius) || 500;
      const data = airports
        .map((a) => ({ a, km: haversineKm(lat, lon, a.lat, a.lon) }))
        .filter(({ km }) => km <= radius)
        .sort((x, y) => x.km - y.km)
        .slice(0, 10)
        .map(({ a, km }) => ({
          type: "location",
          subType: "AIRPORT",
          name: a.name.toUpperCase(),
          iataCode: a.iata,
          address: { cityName: a.city.toUpperCase(), countryCode: "IN" },
          geoCode: { latitude: a.lat, longitude: a.lon },
          distance: { value: Math.round(km), unit: "KM" },
        }));
      return ok(config, { meta: { count: data.length }, data });
    },
  },
  {
    match: (url) => url.hostname === "airportgap.com" && url.pathname.endsWith("/airports/distance"),
    handle: (config, { inputs }) => {
      const from = byIata(inputs.from);
      const to = byIata(inputs.to);
      if (!from || !to) {
        return fail(config, 404, { errors: [{ status: "404", title: "Not Found", detail: "Airport not found in demo data" }] });
      }
      const km = haversineKm(from.lat, from.lon, to.lat, to.lon);
      return ok(config, {
        data: {
          id: `${from.iata}-${to.iata}`,
          type: "airport_distance",
          attributes: {
            from_airport: airportgapAirport(from),
            to_airport: airportgapAirport(to),
            kilometers: Math.round(km * 100) / 100,
            miles: Math.round(km * 0.621371 * 100) / 100,
            nautical_miles: Math.round(km * 0.539957 * 100) / 100,
          },
        },
      });
    },
  },
  {
    // Rough narrow-body figures: ~1.1 t for taxi, climb and descent plus ~3 kg per km cruise
    match: (url) => url.hostname === "despouy.ca" && url.pathname.includes("/flight-fuel-api"),
    handle: (config, { inputs }) => {
      const distance = parseFloat(inputs.distance) || 0;
      const fuel = Math.round(1100 + distance * 3.0);
      return ok(config, [
        {
          icao24: inputs.aircraft || null,
          distance: Math.round(distance * 100) / 100,
          fuel,
          co2: Math.round(fuel * 3.16),
          icao: "A320",
          iata: "320",
          model: "Airbus A320 (demo estimate)",
          gcd: true,
        },
      ]);
    },
  },
  {
    match: (url) => url.hostname === "airport-info.p.rapidapi.com",
    handle: (config, { inputs }) => {
      const a = byIata(inputs.iata);
      if (!a) return fail(config, 404, { error: "Airport not found in demo data" });
      return ok(config, {
        id: a.iata,
        iata: a.iata,
        icao: a.icao,
        name: a.name,
        location: `${a.city}, India`,
        country: "India",
        country_iso: "IN",
        latitude: a.lat,
        longitude: a.lon,
      });
    },
  },
];

function installMocks(axios) {
  axios.defaults.adapter = async (config) => {
    const parsed = readInputs(config);
    const handler = handlers.find((h) => h.match(parsed.url));
    if (!handler) {
      // Never fall through to the network in mock mode
      return fail(config, 501, { error: `No mock for ${parsed.url.hostname}${parsed.url.pathname}` });
    }
    return handler.handle(config, parsed);
  };
}

module.exports = { installMocks };
