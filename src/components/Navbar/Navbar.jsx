import React from "react";
import "./Navbar.css";

export default function Navbar({ onLogoClick }) {
  return (
    <header className="navbar-container">
      <div
        className="navbar-logo"
        onClick={onLogoClick}
        title="Ir a Panel Admin"
      >
        wix-o
      </div>
      <div className="navbar-title">DEAD PARTY VOL.2</div>
      <div className="navbar-icon">🟩</div>
    </header>
  );
}
