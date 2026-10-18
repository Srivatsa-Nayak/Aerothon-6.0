// Demo airport data for mock mode: South Indian airports around the routes in server.js.
// Coordinates and elevations are approximate and for demonstration only.
const airports = [
  { iata: "BLR", icao: "VOBL", name: "Kempegowda International Airport", city: "Bangalore", lat: 13.1986, lon: 77.7066, altitude: 3000 },
  { iata: "IXE", icao: "VOML", name: "Mangalore International Airport", city: "Mangalore", lat: 12.9613, lon: 74.8901, altitude: 337 },
  { iata: "MAA", icao: "VOMM", name: "Chennai International Airport", city: "Chennai", lat: 12.9941, lon: 80.1709, altitude: 52 },
  { iata: "CJB", icao: "VOCB", name: "Coimbatore International Airport", city: "Coimbatore", lat: 11.03, lon: 77.0434, altitude: 1324 },
  { iata: "TIR", icao: "VOTP", name: "Tirupati Airport", city: "Tirupati", lat: 13.6325, lon: 79.5433, altitude: 350 },
  { iata: "CDP", icao: "VOCP", name: "Kadapa Airport", city: "Cuddapah", lat: 14.51, lon: 78.7728, altitude: 430 },
  { iata: "MYQ", icao: "VOMY", name: "Mysore Airport", city: "Mysore", lat: 12.23, lon: 76.6558, altitude: 2349 },
  { iata: "HYD", icao: "VOHS", name: "Rajiv Gandhi International Airport", city: "Hyderabad", lat: 17.2403, lon: 78.4294, altitude: 2024 },
  { iata: "VGA", icao: "VOBZ", name: "Vijayawada International Airport", city: "Vijayawada", lat: 16.5304, lon: 80.7968, altitude: 82 },
  { iata: "COK", icao: "VOCI", name: "Cochin International Airport", city: "Kochi", lat: 10.152, lon: 76.4019, altitude: 30 },
  { iata: "TRV", icao: "VOTV", name: "Trivandrum International Airport", city: "Thiruvananthapuram", lat: 8.4821, lon: 76.9201, altitude: 15 },
  { iata: "IXM", icao: "VOMD", name: "Madurai Airport", city: "Madurai", lat: 9.8345, lon: 78.0934, altitude: 459 },
  { iata: "TRZ", icao: "VOTR", name: "Tiruchirappalli International Airport", city: "Tiruchirappalli", lat: 10.7654, lon: 78.7097, altitude: 288 },
  { iata: "PNY", icao: "VOPC", name: "Puducherry Airport", city: "Puducherry", lat: 11.968, lon: 79.812, altitude: 144 },
  { iata: "GOI", icao: "VOGO", name: "Goa International Airport", city: "Goa", lat: 15.3808, lon: 73.8314, altitude: 150 },
  { iata: "HBX", icao: "VOHB", name: "Hubli Airport", city: "Hubli", lat: 15.3617, lon: 75.0849, altitude: 2171 },
  { iata: "IXG", icao: "VOBM", name: "Belagavi Airport", city: "Belgaum", lat: 15.8593, lon: 74.6183, altitude: 2487 },
];

const byIata = (code) => airports.find((a) => a.iata === String(code || "").toUpperCase());

// Great-circle distance in km
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

module.exports = { airports, byIata, haversineKm };
