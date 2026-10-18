import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/lib/api";

// Shown when the backend runs with MOCK_EXTERNAL_APIS=true, so simulated weather is never mistaken for real.
export default function DemoNotice() {
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/config`)
      .then((r) => setMockMode(!!r.data.mockMode))
      .catch(() => {});
  }, []);

  if (!mockMode) return null;

  return (
    <div className="bg-buff/20 border-b border-buff/50">
      <p className="max-w-6xl mx-auto px-4 sm:px-6 py-2 text-sm">
        <span className="font-semibold">Demo data.</span> Weather, airports and fuel figures are simulated.
        Try IXE to BLR, or a landing at HYD.
      </p>
    </div>
  );
}
