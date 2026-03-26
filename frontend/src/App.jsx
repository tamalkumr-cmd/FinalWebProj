import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Existing Pages
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import Dashboard from "./pages/Dashboard";
import CreateListing from "./pages/CreateListing";
import ProductPage from "./pages/ProductPage";
import ChatPage from "./pages/ChatPage";

// ✈️ NEW AVIATION MODULES
import FlightMap from "./pages/FlightMap"; 
import SeatConfig from "./pages/SeatConfig";
// 🛰️ GROUND OPS MODULE
import FlightOperations from "./pages/FlightOperations"; 

import "leaflet/dist/leaflet.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const handleStorage = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const Protected = ({ children }) => token ? children : <Navigate to="/login" />;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={<Login setToken={setToken} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<Verify />} />
      
      {/* 🛠️ AVIATION HUB ROUTES */}
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/radar" element={<Protected><FlightMap /></Protected>} />
      
      {/* 💺 SEAT ALLOCATION & MANIFEST OPS */}
      <Route path="/config" element={<Protected><SeatConfig /></Protected>} />
      <Route path="/ops" element={<Protected><FlightOperations /></Protected>} />
      
      {/* FLIGHT MANAGEMENT */}
      <Route path="/create-listing" element={<Protected><CreateListing /></Protected>} />
      <Route path="/product/:id" element={<Protected><ProductPage /></Protected>} />
      <Route path="/chat/:listingId" element={<Protected><ChatPage /></Protected>} />
    </Routes>
  );
}

export default App;