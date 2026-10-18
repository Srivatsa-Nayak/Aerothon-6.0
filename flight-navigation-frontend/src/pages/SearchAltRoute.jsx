import React, { useState } from "react";
import axios from "axios";
import FlightMap from "./FlightMap";
import { API_URL } from "@/lib/api";

export default function SearchAltRoute() {
  const [fromDestination, setFromDestination] = useState("");
  const [toDestination, setToDestination] = useState("");
  const [icao24, setIcao24] = useState("");
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState([]);
  const [airportDetails, setAirportDetails] = useState([]);
  const [distance, setDistance] = useState(null);
  const [altFuelInfo, setAltFuelInfo] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[A-Za-z]{3}$/.test(fromDestination) || !/^[A-Za-z]{3}$/.test(toDestination)) {
      setError("Enter 3-letter IATA codes for both airports.");
      return;
    }
    setLoading(true);
    setError("");
    setAirportDetails([]);
    setRoute([]);
    setAltFuelInfo(null);

    try {
      // Call the airport-graphs API through the backend server
      let response;
      try {
        response = await axios.post(`${API_URL}/api/airport-graphs`, {
          sourceIataCode: fromDestination,
          destinationIataCode: toDestination,
        });
      } catch (err) {
        const body = err.response?.data;
        throw new Error(
          body?.reason === "no_safe_route"
            ? `${body.message} Every possible leg either has weather below limits or isn't in the route table.`
            : body?.error
              ? `${body.error}. The airport search service may have rejected the backend's Amadeus key.`
              : `Couldn't reach the backend at ${API_URL}.`
        );
      }

      const { path, distance } = response.data;
      // Older backends return an unreachable destination as distance "Infinity"
      if (!Array.isArray(path) || path.length < 2 || !Number.isFinite(parseFloat(distance))) {
        throw new Error(
          `No route from ${fromDestination} to ${toDestination} has every leg within weather limits.`
        );
      }
      setDistance(distance);

      const coordinatesArray = await Promise.all(
        path.map(async (iata) => {
          const airportResponse = await axios.get(`${API_URL}/api/airport-info`, { params: { iata } });
          const { latitude, longitude, name } = airportResponse.data;
          return { iata, latitude, longitude, name };
        })
      );

      setRoute(coordinatesArray.map((item) => [item.latitude, item.longitude]));
      setAirportDetails(coordinatesArray);

      // Fuel for the alternative path is optional: only when an aircraft code was given.
      if (icao24) {
        try {
          const altFuelResponse = await axios.get(`${API_URL}/api/flight-fuel`, {
            params: { aircraft: icao24, distance, gcd: true },
          });
          await axios.post(`${API_URL}/api/insertFlightFuel`, altFuelResponse.data[0]);
          const { fuel: altFuel, co2: altCo2 } = altFuelResponse.data[0];
          setAltFuelInfo(altFuel == null ? { unavailable: true } : { distance, altFuel, altCo2 });
        } catch (fuelErr) {
          console.error(fuelErr);
          setAltFuelInfo({ unavailable: true });
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const first = airportDetails[0];
  const last = airportDetails[airportDetails.length - 1];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <section className="pt-10 pb-8 sm:pt-14">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight max-w-2xl">Find an alternate</h1>
        <p className="mt-3 text-lg text-ink-soft max-w-xl">
          When weather blocks the direct route, find the shortest path to the destination through
          nearby airports, using only legs that are within limits.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-8">
          <div className="strip flex-col md:flex-row">
            <div className="strip-band h-2 w-full md:h-auto md:w-3 bg-magenta" aria-hidden="true" />
            <div className="grid flex-1 grid-cols-2 md:grid-cols-[1fr_1fr_1.4fr]">
              <label className="strip-cell border-r border-b md:border-b-0">
                <span className="strip-label">From</span>
                <input
                  type="text"
                  value={fromDestination}
                  onChange={(e) => setFromDestination(e.target.value.toUpperCase())}
                  placeholder="IXE"
                  maxLength={3}
                  autoComplete="off"
                  spellCheck="false"
                  className="strip-input text-4xl tracking-wide uppercase"
                />
              </label>
              <label className="strip-cell border-b md:border-b-0 md:border-r">
                <span className="strip-label">To</span>
                <input
                  type="text"
                  value={toDestination}
                  onChange={(e) => setToDestination(e.target.value.toUpperCase())}
                  placeholder="BLR"
                  maxLength={3}
                  autoComplete="off"
                  spellCheck="false"
                  className="strip-input text-4xl tracking-wide uppercase"
                />
              </label>
              <label className="strip-cell col-span-2 md:col-span-1">
                <span className="strip-label">Aircraft ICAO24 code, for fuel estimate (optional)</span>
                <input
                  type="text"
                  value={icao24}
                  onChange={(e) => setIcao24(e.target.value.toUpperCase())}
                  autoComplete="off"
                  className="strip-input text-2xl uppercase"
                />
              </label>
            </div>
          </div>
          <div className="mt-4">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Searching airports…" : "Find alternate route"}
            </button>
          </div>
        </form>

        {error && (
          <p role="alert" className="mt-4 border-l-4 border-hold bg-sheet px-4 py-3 text-hold">
            {error}
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]" aria-live="polite">
        {airportDetails.length > 0 && (
          <section className="panel">
            <p className="strip-label">Alternate route</p>
            <h2 className="text-3xl font-bold mt-1 num">{distance} km</h2>
            <ol className="m-0 mt-5 p-0 list-none">
              {airportDetails.map((airport, index) => (
                <li key={airport.iata + index} className="relative pl-8 pb-4 last:pb-0">
                  {index < airportDetails.length - 1 && (
                    <span className="absolute left-[9px] top-5 bottom-0 w-0.5 bg-magenta" aria-hidden="true" />
                  )}
                  <span className="absolute left-0 top-1 h-5 w-5 rounded-full border-2 border-ink bg-sheet" aria-hidden="true" />
                  <span className="strip-label block">
                    {airport === first ? "Start" : airport === last ? "Destination" : "Via"}
                  </span>
                  <span className="font-display font-semibold text-lg">
                    {airport.iata} <span className="font-sans font-normal text-base">{airport.name}</span>
                  </span>
                </li>
              ))}
            </ol>
            {altFuelInfo && !altFuelInfo.unavailable && (
              <dl className="m-0 mt-5 pt-4 border-t grid grid-cols-2 gap-3">
                <div>
                  <dt className="strip-label">Fuel required</dt>
                  <dd className="m-0 font-display font-semibold text-xl num">{altFuelInfo.altFuel} kg</dd>
                </div>
                <div>
                  <dt className="strip-label">CO₂ emitted</dt>
                  <dd className="m-0 font-display font-semibold text-xl num">{altFuelInfo.altCo2} kg</dd>
                </div>
              </dl>
            )}
            {altFuelInfo?.unavailable && (
              <p className="mt-5 pt-4 border-t text-sm text-ink-soft">
                No fuel estimate for {icao24}. Check the ICAO24 code.
              </p>
            )}
          </section>
        )}
        <FlightMap
          route={route}
          labels={airportDetails.map((a) => a.iata)}
          className={`h-96 ${airportDetails.length > 0 ? "" : "lg:col-span-2"}`}
        />
      </div>
    </div>
  );
}
