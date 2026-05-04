import { useState } from "react";
import LandingPage from "./LandingPage";
import Dashboard from "./Dashboard";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("landing");

  const handleAuth = (userData) => {
    setUser(userData);
    switchMode("dashboard");
  };

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setTimeout(() => {setMode(newMode);}, 200);
  };

  return (
    <div>
      {mode === "landing" ? (
        <LandingPage onAuth={handleAuth} onSwitch={() => switchMode("dashboard")} />
      ) : (
        <Dashboard onSwitch={() => switchMode("landing")} user={user}/>
      )}
    </div>
  );
}
