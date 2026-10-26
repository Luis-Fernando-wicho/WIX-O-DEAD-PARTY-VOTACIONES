import React, { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import AdminLogin from "./components/AdminLogin/AdminLogin";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import VotingScreen from "./components/VotingScreen/VotingScreen";
import "./index.css";

export default function App() {
  const [currentView, setCurrentView] = useState("home"); // 'home' | 'admin-login' | 'admin-dashboard' | 'voting'
  const [activeCode, setActiveCode] = useState("");

  const handleLogoClick = () => {
    setCurrentView("admin-login");
  };

  const handleAccessVoting = (code) => {
    setActiveCode(code);
    setCurrentView("voting");
  };

  return (
    <div className="main-layout">
      <Navbar onLogoClick={handleLogoClick} />

      {currentView === "home" && <Home onAccessVoting={handleAccessVoting} />}

      {currentView === "admin-login" && (
        <AdminLogin
          onLoginSuccess={() => setCurrentView("admin-dashboard")}
          onCancel={() => setCurrentView("home")}
        />
      )}

      {currentView === "admin-dashboard" && (
        <AdminDashboard onLogout={() => setCurrentView("home")} />
      )}

      {currentView === "voting" && (
        <VotingScreen
          userCode={activeCode}
          onExit={() => setCurrentView("home")}
        />
      )}
    </div>
  );
}
