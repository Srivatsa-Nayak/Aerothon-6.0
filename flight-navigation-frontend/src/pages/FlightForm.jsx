import React, { useState } from "react";

// The route check form, laid out as a flight progress strip.
// The holder band is blue for departures and buff for arrivals, as on a controller's strip board.
function FlightForm({
  fromAirport,
  setFromAirport,
  toAirport,
  setToAirport,
  flightType,
  setFlightType,
  aircraftData,
  selectedAircraftModel,
  setSelectedAircraftModel,
  handleSubmit,
  loading,
}) {
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!/^[A-Za-z]{3}$/.test(fromAirport)) newErrors.fromAirport = "Enter a 3-letter IATA code";
    if (!/^[A-Za-z]{3}$/.test(toAirport)) newErrors.toAirport = "Enter a 3-letter IATA code";
    if (!selectedAircraftModel) newErrors.selectedAircraftModel = "Choose an aircraft";
    return newErrors;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      handleSubmit(e);
    }
  };

  const noAircraft = !Array.isArray(aircraftData) || aircraftData.length === 0;

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="strip flex-col md:flex-row">
        <div
          className={`strip-band h-2 w-full md:h-auto md:w-3 ${flightType === "takeoff" ? "bg-chart" : "bg-buff"}`}
          aria-hidden="true"
        />
        <div className="grid flex-1 grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <label className="strip-cell col-span-2 md:col-span-1 border-b md:border-b-0 md:border-r">
            <span className="strip-label">Aircraft</span>
            <select
              value={selectedAircraftModel}
              onChange={(e) => setSelectedAircraftModel(e.target.value)}
              className="strip-input text-xl cursor-pointer"
              aria-invalid={!!errors.selectedAircraftModel}
            >
              <option value="" disabled>
                {noAircraft ? "No aircraft loaded" : "Choose aircraft"}
              </option>
              {Array.isArray(aircraftData) &&
                aircraftData.map((aircraft) => (
                  <option key={aircraft.aircraftID} value={aircraft.model}>
                    {aircraft.model} ({aircraft.aircraftID})
                  </option>
                ))}
            </select>
            {errors.selectedAircraftModel && <FieldError>{errors.selectedAircraftModel}</FieldError>}
          </label>

          <label className="strip-cell border-r border-b md:border-b-0">
            <span className="strip-label">From</span>
            <input
              type="text"
              value={fromAirport}
              onChange={(e) => setFromAirport(e.target.value.toUpperCase())}
              placeholder="BLR"
              maxLength={3}
              autoComplete="off"
              spellCheck="false"
              className="strip-input text-4xl tracking-wide uppercase"
              aria-invalid={!!errors.fromAirport}
            />
            {errors.fromAirport && <FieldError>{errors.fromAirport}</FieldError>}
          </label>

          <label className="strip-cell border-b md:border-b-0 md:border-r">
            <span className="strip-label">To</span>
            <input
              type="text"
              value={toAirport}
              onChange={(e) => setToAirport(e.target.value.toUpperCase())}
              placeholder="TIR"
              maxLength={3}
              autoComplete="off"
              spellCheck="false"
              className="strip-input text-4xl tracking-wide uppercase"
              aria-invalid={!!errors.toAirport}
            />
            {errors.toAirport && <FieldError>{errors.toAirport}</FieldError>}
          </label>

          <fieldset className="strip-cell col-span-2 md:col-span-1 m-0">
            <legend className="strip-label float-left mb-1 p-0 text-sm w-auto">Operation</legend>
            <div className="clear-both flex border border-ink rounded-sm overflow-hidden w-fit">
              {[
                { value: "takeoff", label: "Takeoff" },
                { value: "landing", label: "Landing" },
              ].map((op) => (
                <label
                  key={op.value}
                  className={`px-4 py-1.5 font-display font-semibold cursor-pointer select-none transition-colors ${
                    flightType === op.value ? "bg-ink text-white" : "text-ink hover:bg-paper"
                  }`}
                >
                  <input
                    type="radio"
                    name="operation"
                    value={op.value}
                    checked={flightType === op.value}
                    onChange={(e) => setFlightType(e.target.value)}
                    className="sr-only"
                  />
                  {op.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Checking weather…" : "Check route"}
        </button>
        <p className="text-sm text-ink-soft">
          Checks wind and visibility at departure, the cities en route, and destination.
        </p>
      </div>
    </form>
  );
}

function FieldError({ children }) {
  return <span className="text-sm text-hold">{children}</span>;
}

export default FlightForm;
