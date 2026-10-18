import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import FlightForm from "./FlightForm";
import FlightMap from "./FlightMap";
import FlightInfo from "./FlightInfo";
import WeatherCard from "./WeatherCard";
import FlightDetailsCard from "./FlightDetailsCard";
import WeatherDetails from "./WeatherDetails";
import RouteRibbon from "@/components/RouteRibbon";
import { API_URL } from "@/lib/api";
import { assessWeather } from "@/lib/weather";

// Cities overflown between two airports, matched by IATA code in either direction,
// directly or through one connecting airport (same rules as getCitiesCovered in server.js).
function getCitiesCovered(originIata, destinationIata, routes) {
  const findRoute = (a, b) =>
    routes.find(
      (r) =>
        (r.originIATACode === a && r.destinationIATACode === b) ||
        (r.originIATACode === b && r.destinationIATACode === a)
    );

  const direct = findRoute(originIata, destinationIata);
  if (direct) return direct.citiesCovered;

  for (const r of routes) {
    const via =
      r.originIATACode === originIata ? r.destinationIATACode :
      r.destinationIATACode === originIata ? r.originIATACode : null;
    const onward = via && findRoute(via, destinationIata);
    if (onward) return [...new Set([...r.citiesCovered, ...onward.citiesCovered])];
  }
  return [];
}

// Turns per-station weather into one decision, in the order the original checks ran:
// departure first, then destination, then the cities en route.
function decide(flightType, stations) {
  const dep = stations[0];
  const dest = stations[stations.length - 1];
  const enRoute = stations.slice(1, -1);
  const missing = stations.find((s) => s.status === "unknown");
  if (missing) {
    return { tone: "hold", title: `Hold: no weather report for ${missing.name}`, detail: "The weather service returned nothing for this station, so the route can't be cleared. Try again, or check the station name." };
  }

  if (flightType === "landing") {
    return dest.status === "ok"
      ? { tone: "go", title: "Cleared to land", detail: `${dest.name} is within landing limits.` }
      : { tone: "hold", action: "divert", title: "Divert: destination below landing limits", detail: dest.reasons.join(". ") + "." };
  }
  if (dep.status !== "ok") {
    return { tone: "hold", title: "Hold: departure weather below limits", detail: `Takeoff from ${dep.name} will be delayed. ${dep.reasons.join(". ")}.` };
  }
  if (dest.status !== "ok") {
    return { tone: "hold", title: "Hold: destination weather below limits", detail: `Takeoff will be delayed until ${dest.name} improves. ${dest.reasons.join(". ")}.` };
  }
  const badLeg = enRoute.find((s) => s.status !== "ok");
  if (badLeg) {
    return { tone: "hold", action: "reroute", title: "Reroute: weather en route below limits", detail: `${badLeg.name}: ${badLeg.reasons.join(". ")}.` };
  }
  return { tone: "go", title: "Cleared for takeoff", detail: `Wind and visibility are within limits at all ${stations.length} stations.` };
}

export default function FlightSearchBar() {
  const [fromAirport, setFromAirport] = useState("");
  const [toAirport, setToAirport] = useState("");
  const [flightType, setFlightType] = useState("takeoff");
  const [route, setRoute] = useState(null);
  const [kilometers, setKilometers] = useState(null);
  const [fromAirportInfo, setFromAirportInfo] = useState(null);
  const [toAirportInfo, setToAirportInfo] = useState(null);
  const [nearbyRoute, setNearbyRoute] = useState(null);
  const [aircraftData, setAircraftData] = useState([]);
  const [aircraftError, setAircraftError] = useState("");
  const [selectedAircraftModel, setSelectedAircraftModel] = useState("");
  const [stations, setStations] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [checkedType, setCheckedType] = useState("takeoff");
  const [showDivert, setShowDivert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAircraftData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/aircraft`);
        setAircraftData(response.data);
      } catch (error) {
        console.error("Error fetching aircraft data:", error);
        setAircraftError("Aircraft list unavailable: the backend or its database isn't reachable.");
      }
    };

    fetchAircraftData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNearbyRoute(null);

    try {
      let response;
      try {
        response = await axios.post(`${API_URL}/api/airport-distance`, { from: fromAirport, to: toAirport });
      } catch {
        throw new Error(`Couldn't find ${fromAirport} or ${toAirport}. Check both are valid IATA airport codes.`);
      }

      const { from_airport, to_airport, kilometers } = response.data.data.attributes;
      const from_city = from_airport.city;
      const to_city = to_airport.city;

      const routesData = await axios.get(`${API_URL}/api/getRoute`);
      const citiesCovered = getCitiesCovered(from_airport.iata, to_airport.iata, routesData.data);

      const stationList = [
        { role: "Departure", name: from_city },
        ...citiesCovered.map((c) => ({ role: "En route", name: c })),
        { role: "Destination", name: to_city },
      ];

      const weathers = await Promise.all(
        stationList.map((s) =>
          axios
            .post(`${API_URL}/api/getlocation`, { location: s.name })
            .then((r) => r.data)
            .catch(() => null)
        )
      );

      const assessed = stationList.map((s, i) => {
        const weather = weathers[i];
        if (!weather) return { ...s, weather: null, status: "unknown", reasons: ["No weather data available"] };
        const { ok, reasons } = assessWeather(weather);
        return { ...s, weather, status: ok ? "ok" : "bad", reasons };
      });

      // Record the looked-up airports; failures here shouldn't block the result.
      axios.post(`${API_URL}/api/insertAirport`, response.data).catch(() => {});
      axios.post(`${API_URL}/api/insertDestinationAirport`, response.data).catch(() => {});

      setStations(assessed);
      setCheckedType(flightType);
      setVerdict(decide(flightType, assessed));
      setFromAirportInfo(from_airport);
      setToAirportInfo(to_airport);
      setRoute([
        [parseFloat(from_airport.latitude), parseFloat(from_airport.longitude)],
        [parseFloat(to_airport.latitude), parseFloat(to_airport.longitude)],
      ]);
      setKilometers(kilometers);
    } catch (err) {
      console.error("Error checking the route:", err);
      setStations(null);
      setVerdict(null);
      setError(err.message?.startsWith("Couldn't") ? err.message : "Couldn't reach the backend. Check it's running on " + API_URL + ".");
    } finally {
      setLoading(false);
    }
  };

  const selectedAircraft = aircraftData?.find(
    (aircraft) => aircraft.model === selectedAircraftModel
  );

  const fromWeather = stations?.[0]?.weather;
  const toWeather = stations?.[stations.length - 1]?.weather;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <section className="pt-10 pb-8 sm:pt-14">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight max-w-2xl">Can this flight go?</h1>
        <p className="mt-3 text-lg text-ink-soft max-w-xl">
          Enter the route and aircraft. Route Check reads the weather at every station on the way
          and tells you whether to go, hold, reroute or divert.
        </p>
        {aircraftError && <p className="mt-3 text-hold">{aircraftError}</p>}
        <div className="mt-8">
          <FlightForm
            fromAirport={fromAirport}
            setFromAirport={setFromAirport}
            toAirport={toAirport}
            setToAirport={setToAirport}
            flightType={flightType}
            setFlightType={setFlightType}
            aircraftData={aircraftData}
            selectedAircraftModel={selectedAircraftModel}
            setSelectedAircraftModel={setSelectedAircraftModel}
            handleSubmit={handleSubmit}
            loading={loading}
          />
        </div>
        {error && (
          <p role="alert" className="mt-4 border-l-4 border-hold bg-sheet px-4 py-3 text-hold">
            {error}
          </p>
        )}
      </section>

      {verdict && stations && (
        <div className="grid gap-6" aria-live="polite">
          <section className="strip">
            <div className={`strip-band ${verdict.tone === "go" ? "bg-go" : "bg-hold"}`} aria-hidden="true" />
            <div className="flex-1 flex flex-wrap items-center justify-between gap-4 px-5 py-5">
              <div>
                <p className="strip-label num">
                  {fromAirportInfo.iata} to {toAirportInfo.iata}, {Math.round(kilometers).toLocaleString()} km,{" "}
                  {checkedType === "takeoff" ? "takeoff" : "landing"}
                </p>
                <h2 className={`text-3xl sm:text-4xl font-bold mt-1 ${verdict.tone === "go" ? "text-go" : "text-hold"}`}>
                  {verdict.title}
                </h2>
                <p className="mt-1 max-w-2xl">{verdict.detail}</p>
              </div>
              {verdict.action === "reroute" && (
                <Link to="/altroute" className="btn-secondary no-underline">
                  Find an alternate route
                </Link>
              )}
              {verdict.action === "divert" && (
                <button type="button" className="btn-secondary" onClick={() => setShowDivert(true)}>
                  Find a diversion airport
                </button>
              )}
            </div>
          </section>

          <section className="panel">
            <div>
              <RouteRibbon stations={stations} />
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[1fr_2fr_1fr]">
            <FlightInfo AirportInfo={fromAirportInfo} path="Departure" />
            <FlightMap
              route={nearbyRoute || route}
              labels={nearbyRoute ? ["Aircraft", "Diversion"] : [fromAirportInfo.iata, toAirportInfo.iata]}
              className="h-80 lg:h-full min-h-[20rem]"
            />
            <FlightInfo AirportInfo={toAirportInfo} path="Destination" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <WeatherDetails weatherData={fromWeather} path="Departure" />
            <WeatherDetails weatherData={toWeather} path="Destination" />
          </div>

          <FlightDetailsCard aircraft={selectedAircraft} />

          <WeatherCard
            show={showDivert}
            onHide={() => setShowDivert(false)}
            destinationIataCode={toAirportInfo.iata}
            defaultPosition={route?.[1]}
            setNearbyRoute={setNearbyRoute}
          />
        </div>
      )}
    </div>
  );
}
