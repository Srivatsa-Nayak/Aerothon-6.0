import React from "react";
import { MAX_WIND_KPH, MIN_VISIBILITY_KM } from "@/lib/weather";

// A horizontal gauge with the operating limit marked on it.
const LimitGauge = ({ label, value, unit, max, limit, badWhen }) => {
  const pct = Math.min(value / max, 1) * 100;
  const limitPct = (limit / max) * 100;
  const bad = badWhen === "above" ? value > limit : value < limit;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-ink-soft">{label}</span>
        <span className={`font-display font-semibold text-xl num ${bad ? "text-hold" : ""}`}>
          {value} {unit}
        </span>
      </div>
      <div className="relative mt-1.5 h-2 bg-paper rounded-full">
        <div className={`absolute inset-y-0 left-0 rounded-full ${bad ? "bg-hold" : "bg-chart"}`} style={{ width: `${pct}%` }} />
        <div className="absolute -top-1 -bottom-1 w-0.5 bg-ink" style={{ left: `${limitPct}%` }} aria-hidden="true" />
      </div>
      <p className="mt-1 text-xs text-ink-soft">
        Limit: {badWhen === "above" ? "at most" : "at least"} {limit} {unit}
      </p>
    </div>
  );
};

const Reading = ({ label, children }) => (
  <div>
    <dt className="text-sm text-ink-soft">{label}</dt>
    <dd className="m-0 font-display font-semibold text-lg num">{children}</dd>
  </div>
);

const uvLabel = (uv) => (uv < 3 ? "Low" : uv < 6 ? "Moderate" : uv < 8 ? "High" : uv < 11 ? "Very high" : "Extreme");

const WeatherDetails = ({ weatherData, path }) => {
  if (!weatherData) return null;

  const {
    location,
    text,
    temperature,
    wind,
    visibility,
    humidity,
    cloudCover,
    uvIndex,
    pressure,
    precipitation,
    gust,
  } = weatherData;

  return (
    <section className="panel">
      <p className="strip-label">{path} weather</p>
      <div className="flex items-baseline justify-between gap-3 mt-1">
        <h3 className="text-2xl font-bold">{location}</h3>
        <span className="text-ink-soft">{text}</span>
      </div>

      <div className="mt-5 grid gap-5">
        <LimitGauge label={`Wind, from ${wind.direction}`} value={wind.speed} unit="km/h" max={MAX_WIND_KPH * 2} limit={MAX_WIND_KPH} badWhen="above" />
        <LimitGauge label="Visibility" value={visibility.km} unit="km" max={10} limit={MIN_VISIBILITY_KM} badWhen="below" />
      </div>

      <dl className="mt-6 pt-4 border-t grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 m-0">
        <Reading label="Temperature">{temperature.celsius} °C</Reading>
        <Reading label="Pressure">{pressure.mb} hPa</Reading>
        <Reading label="Gusts">{gust ? `${gust.kph} km/h` : "–"}</Reading>
        <Reading label="Humidity">{humidity}%</Reading>
        <Reading label="Cloud cover">{cloudCover}%</Reading>
        <Reading label="Precipitation">{precipitation.mm} mm</Reading>
        <Reading label="UV index">
          {uvIndex} <span className="font-sans font-normal text-sm text-ink-soft">{uvLabel(uvIndex)}</span>
        </Reading>
      </dl>
    </section>
  );
};

export default WeatherDetails;
