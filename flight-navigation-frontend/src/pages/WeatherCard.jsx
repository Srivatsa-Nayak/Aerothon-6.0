// WeatherCard.jsx — the divert dialog shown when the destination is below landing limits.
import React, { useEffect, useRef } from "react";
import NearbyAirportSearcher from "./NearbyAirportSearcher";

function WeatherCard({ show, onHide, destinationIataCode, defaultPosition, setNearbyRoute }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (show && !dialog.open) dialog.showModal();
    if (!show && dialog.open) dialog.close();
  }, [show]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onHide}
      className="divert-dialog w-[min(36rem,calc(100vw-2rem))] border bg-sheet text-ink p-0 rounded-sm"
      aria-labelledby="divert-title"
    >
      <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
        <h2 id="divert-title" className="text-2xl font-bold">
          Find a diversion airport
        </h2>
        <button type="button" onClick={onHide} className="text-ink-soft hover:text-ink text-2xl leading-none px-2" aria-label="Close">
          ×
        </button>
      </div>
      <div className="px-5 py-5">
        {show && (
          <NearbyAirportSearcher
            setNearbyRoute={setNearbyRoute}
            destinationIataCode={destinationIataCode}
            defaultPosition={defaultPosition}
            onFound={onHide}
          />
        )}
      </div>
    </dialog>
  );
}

export default WeatherCard;
