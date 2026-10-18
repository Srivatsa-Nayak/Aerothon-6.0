import React from "react";
import { MAX_WIND_KPH, MIN_VISIBILITY_KM } from "@/lib/weather";

// Stations along the route, drawn like a route line on a chart: each station's
// wind and visibility, with the reading that breaks a limit marked in rust.
export default function RouteRibbon({ stations }) {
  return (
    <ol className="m-0 p-0 list-none grid gap-0" style={{ gridTemplateColumns: `repeat(${stations.length}, minmax(0, 1fr))` }}>
      {stations.map((s, i) => {
        const windBad = s.weather && s.weather.wind.speed > MAX_WIND_KPH;
        const visBad = s.weather && s.weather.visibility.km < MIN_VISIBILITY_KM;
        return (
          <li key={`${s.name}-${i}`} className="relative flex flex-col items-center text-center px-1">
            {/* route line segments either side of the station mark */}
            <span
              className={`absolute top-[11px] left-0 right-1/2 h-0.5 ${i === 0 ? "bg-transparent" : "bg-magenta"}`}
              aria-hidden="true"
            />
            <span
              className={`absolute top-[11px] left-1/2 right-0 h-0.5 ${i === stations.length - 1 ? "bg-transparent" : "bg-magenta"}`}
              aria-hidden="true"
            />
            <span
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-sheet ${
                s.status === "ok" ? "border-go" : s.status === "bad" ? "border-hold" : "border-rule"
              }`}
              aria-hidden="true"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${s.status === "ok" ? "bg-go" : s.status === "bad" ? "bg-hold" : "bg-rule"}`} />
            </span>
            <span className="mt-2 text-sm text-ink-soft">{s.role}</span>
            <span className="font-display font-semibold text-lg leading-tight">{s.name}</span>
            {s.weather ? (
              <span className="mt-1 text-sm num leading-snug">
                <span className={windBad ? "text-hold font-semibold" : ""}>
                  Wind {s.weather.wind.speed} km/h
                </span>
                <br />
                <span className={visBad ? "text-hold font-semibold" : ""}>
                  Vis {s.weather.visibility.km} km
                </span>
              </span>
            ) : (
              <span className="mt-1 text-sm text-ink-soft">No weather data</span>
            )}
            <span className="sr-only">
              {s.status === "ok" ? "Within limits" : s.status === "bad" ? "Below limits" : "Unknown"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
