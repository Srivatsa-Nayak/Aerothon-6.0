import React from "react";

function FlightInfo({ AirportInfo, path }) {
  if (!AirportInfo) return null;

  return (
    <section className="panel">
      <p className="strip-label">{path}</p>
      <h3 className="text-3xl font-bold tracking-wide mt-1">{AirportInfo.iata}</h3>
      <p className="font-medium mt-1">{AirportInfo.name}</p>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm num m-0">
        <dt className="text-ink-soft">City</dt>
        <dd className="m-0">{AirportInfo.city}</dd>
        <dt className="text-ink-soft">ICAO</dt>
        <dd className="m-0">{AirportInfo.icao}</dd>
        <dt className="text-ink-soft">Elevation</dt>
        <dd className="m-0">{AirportInfo.altitude} ft</dd>
        <dt className="text-ink-soft">Position</dt>
        <dd className="m-0">
          {Number(AirportInfo.latitude).toFixed(3)}, {Number(AirportInfo.longitude).toFixed(3)}
        </dd>
      </dl>
    </section>
  );
}

export default FlightInfo;
