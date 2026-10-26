import React, { useState } from "react";
import "./AdminLogin.css";

export default function AdminLogin({ onLoginSuccess, onCancel }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // TODO: Puedes cambiar esta contraseña por la de tu preferencia o desde variables de entorno
  const ADMIN_PASSWORD = "wixo";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError("");
      onLoginSuccess();
    } else {
      setError("Contraseña incorrecta");
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <label className="admin-login-label">CONTRASEÑA</label>
        <input
          type="password"
          className="admin-login-input"
          placeholder="******"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />
        {error && <span className="admin-login-error">{error}</span>}
        <button type="submit" className="admin-login-button">
          ENVIAR
        </button>
        <button type="button" className="admin-login-back" onClick={onCancel}>
          ← Volver al inicio
        </button>
      </form>
    </div>
  );
}
