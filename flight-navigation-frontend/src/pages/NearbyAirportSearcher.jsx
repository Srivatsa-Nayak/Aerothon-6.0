// NearbyAirportSearcher.jsx
import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "@/lib/api";

function NearbyAirportSearcher({ setNearbyRoute, destinationIataCode, defaultPosition, onFound }) {
  const [latitude, setLatitude] = useState(defaultPosition ? String(defaultPosition[0]) : "");
  const [longitude, setLongitude] = useState(defaultPosition ? String(defaultPosition[1]) : "");
  const [radius, setRadius] = useState("300");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!latitude || !longitude || !radius) {
      setError("Enter the aircraft's latitude, longitude and a search radius.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/api/get-nearest-airport`, {
        latitude,
        longitude,
        radius,
        destinationIataCode,
      });
      await axios.post(`${API_URL}/api/near`, data);

      setNearbyRoute([
        [parseFloat(latitude), parseFloat(longitude)],
        [parseFloat(data.nearestAirport.geoCode.latitude), parseFloat(data.nearestAirport.geoCode.longitude)],
      ]);
      setResult(data);
    } catch (err) {
      console.error("Error fetching nearby airport:", err);
      setError(
        err.response?.data?.message ||
          "The airport search service didn't respond. Check the backend is running and its Amadeus key is valid."
      );
    } finally {
      setLoading(false);
    }
  };

  const field = "w-full border rounded-sm px-3 py-2 font-display text-lg num focus:outline-none focus:border-chart";

  return (
    <div>
      <p className="text-ink-soft">
        Search outward from the aircraft&apos;s position. {destinationIataCode} is excluded.
      </p>
      <form className="mt-4 grid grid-cols-3 gap-3" onSubmit={handleSearch}>
        <label className="flex flex-col gap-1">
          <span className="strip-label">Latitude</span>
          <input type="text" inputMode="decimal" value={latitude} onChange={(e) => setLatitude(e.target.value)} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="strip-label">Longitude</span>
          <input type="text" inputMode="decimal" value={longitude} onChange={(e) => setLongitude(e.target.value)} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="strip-label">Radius, km</span>
          <input type="text" inputMode="numeric" value={radius} onChange={(e) => setRadius(e.target.value)} className={field} />
        </label>
        <div className="col-span-3">
          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Searching…" : "Find nearest airport"}
          </button>
        </div>
      </form>
      {error && <p className="mt-3 text-hold">{error}</p>}
      {result && (
        <div className="mt-4 border-l-4 border-go bg-paper px-4 py-3">
          <p className="strip-label">Nearest airport</p>
          <p className="font-display font-semibold text-xl">
            {result.nearestAirport.iataCode} {result.nearestAirport.name}
          </p>
          <p className="num">{result.minDistance} km away</p>
          <button type="button" className="btn-secondary mt-3" onClick={onFound}>
            Show on map
          </button>
        </div>
      )}
    </div>
  );
}

export default NearbyAirportSearcher;
