import React from "react";
import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `font-display font-semibold text-lg no-underline pb-1 border-b-2 transition-colors ${
    isActive ? "border-magenta text-ink" : "border-transparent text-ink-soft hover:text-ink"
  }`;

export default function Navbar() {
  return (
    <header className="bg-paper border-b">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <NavLink to="/" className="flex items-center gap-2 no-underline text-ink">
          {/* Waypoint symbol from aeronautical charts: a four-point star */}
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 1 L14.5 9.5 L23 12 L14.5 14.5 L12 23 L9.5 14.5 L1 12 L9.5 9.5 Z" fill="#B0186A" />
          </svg>
          <span className="font-display font-bold text-2xl tracking-tight">Route Check</span>
        </NavLink>
        <ul className="flex gap-6 m-0 p-0 list-none">
          <li>
            <NavLink to="/" end className={linkClass}>
              Check a route
            </NavLink>
          </li>
          <li>
            <NavLink to="/altroute" className={linkClass}>
              Find an alternate
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}
