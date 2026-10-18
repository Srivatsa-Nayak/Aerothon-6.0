import React from "react";

const isAbnormal = (value) => typeof value === "string" && !/^normal$/i.test(value.trim());

// Aircraft health: the two engines side by side, component status, and any active alerts.
const FlightDetailsCard = ({ aircraft }) => {
  if (!aircraft) return null;

  const { engine1, engine2 } = aircraft.engineHealth || {};
  const rows = [
    { label: "EGT margin", e1: `${engine1?.EGTMargin} °C`, e2: `${engine2?.EGTMargin} °C` },
    { label: "Vibration", e1: engine1?.vibration, e2: engine2?.vibration },
    { label: "Oil pressure", e1: engine1?.oilPressure, e2: engine2?.oilPressure },
  ];
  const components = [
    { label: "Hydraulics", value: aircraft.componentStatus?.hydraulicSystem },
    { label: "Avionics", value: aircraft.componentStatus?.avionics },
    { label: "Landing gear", value: aircraft.componentStatus?.landingGear },
  ];
  const alerts = (aircraft.systemAlerts || []).map((a) => a.trim()).filter(Boolean);

  return (
    <section className="panel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="strip-label">Aircraft</p>
          <h3 className="text-2xl font-bold mt-1">
            {aircraft.model} <span className="font-medium text-ink-soft">{aircraft.aircraftID}</span>
          </h3>
        </div>
        <p className="text-sm text-ink-soft num">
          {aircraft.flightHours?.toLocaleString()} flight hours, {aircraft.cycles?.toLocaleString()} cycles
        </p>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <table className="w-full text-sm num">
          <thead>
            <tr className="text-ink-soft text-left">
              <th className="font-normal pb-2"></th>
              <th className="font-normal pb-2">Engine 1</th>
              <th className="font-normal pb-2">Engine 2</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t">
                <th scope="row" className="font-normal text-ink-soft text-left py-2">{r.label}</th>
                <td className={`py-2 font-semibold ${isAbnormal(r.e1) && r.label === "Oil pressure" ? "text-hold" : ""}`}>{r.e1}</td>
                <td className={`py-2 font-semibold ${isAbnormal(r.e2) && r.label === "Oil pressure" ? "text-hold" : ""}`}>{r.e2}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="m-0 text-sm">
          {components.map((c) => (
            <div key={c.label} className="flex justify-between gap-4 border-t py-2">
              <dt className="text-ink-soft">{c.label}</dt>
              <dd className={`m-0 font-semibold text-right ${isAbnormal(c.value) ? "text-hold" : ""}`}>{c.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {alerts.length > 0 && (
        <div className="mt-5 border-l-4 border-hold bg-paper px-4 py-3">
          <p className="font-display font-semibold text-hold">
            {alerts.length === 1 ? "1 active alert" : `${alerts.length} active alerts`}
          </p>
          <ul className="m-0 mt-1 pl-5 text-sm">
            {alerts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default FlightDetailsCard;
