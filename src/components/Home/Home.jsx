import React, { useState } from "react";
import "./Home.css";

export default function Home({ onAccessVoting }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Por favor ingresa un código válido");
      return;
    }

    // Pasamos el código ingresado al componente App para validarlo
    onAccessVoting(code.trim().toUpperCase());
  };

  return (
    <div className="home-container">
      <form className="home-card" onSubmit={handleSubmit}>
        <label htmlFor="code-input" className="home-label">
          CÓDIGO
        </label>
        <input
          id="code-input"
          type="text"
          className="home-input"
          placeholder="CÓDIGO"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError("");
          }}
          maxLength={10}
        />
        {error && <span className="home-error">{error}</span>}
        <button type="submit" className="home-button">
          CÓDIGO
        </button>
      </form>
    </div>
  );
}
