import React from "react";
import FlightSearchBar from "./pages/FlightSearchBar";
import Navbar from "./components/Navbar";
import { Route, Routes } from "react-router-dom";
import WeatherDashboard from "./pages/WeatherDetails";
import SearchAltRoute from "./pages/SearchAltRoute";
import Footer from "./components/Footer";
import DemoNotice from "./components/DemoNotice";


function App() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />
      <DemoNotice />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<FlightSearchBar />} />
          <Route path="/dashboard" element={<WeatherDashboard />} />
          <Route path="/altroute" element={<SearchAltRoute />} />
        </Routes>
      </main>
      <Footer/>
    </div>
  );
}

export default App;
