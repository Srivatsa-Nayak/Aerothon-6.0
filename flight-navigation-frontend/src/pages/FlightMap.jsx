import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const indiaCenter = [20.5937, 78.9629]; // Coordinates for the center of India

// Zooms the map to the route whenever it changes.
function FitToRoute({ route }) {
  const map = useMap();
  useEffect(() => {
    if (route && route.length > 1) {
      map.fitBounds(route, { padding: [40, 40], maxZoom: 9 });
    }
  }, [map, route]);
  return null;
}

function FlightMap({ route, labels = [], className = "h-96" }) {
  const hasRoute = Array.isArray(route) && route.length > 0;

  return (
    <div className={`w-full border rounded-sm overflow-hidden ${className}`}>
      <MapContainer center={indiaCenter} zoom={5} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {hasRoute && (
          <>
            <Polyline positions={route} pathOptions={{ color: "#B0186A", weight: 3 }} />
            {route.map((position, index) => (
              <CircleMarker
                key={index}
                center={position}
                radius={7}
                pathOptions={{ color: "#13293D", weight: 2, fillColor: "#FFFFFF", fillOpacity: 1 }}
              >
                {labels[index] && (
                  <Tooltip permanent direction="top" offset={[0, -8]}>
                    {labels[index]}
                  </Tooltip>
                )}
              </CircleMarker>
            ))}
            <FitToRoute route={route} />
          </>
        )}
      </MapContainer>
    </div>
  );
}

export default FlightMap;
