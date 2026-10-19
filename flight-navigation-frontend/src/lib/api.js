// Backend base URL. Set VITE_API_URL (e.g. the Render deployment) to point the UI elsewhere.
// An empty VITE_API_URL means same-origin requests (/api/...), as used by the container image.
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
