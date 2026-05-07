import { useState, useCallback, useEffect } from "react";
import LandingPage from "./LandingPage";
import Dashboard from "./Dashboard";
import "./App.css";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState(isAuthenticated ? "dashboard" : "landing");

  const switchMode = useCallback((newMode) => {
    setTimeout(() => {setMode(newMode);}, 200);
  }, []);

  useEffect(() => {
	switchMode(isAuthenticated ? "dashboard" : "landing");
  }, [isAuthenticated, switchMode])

  return (
    <div>
      {mode === "landing" ? (
        <LandingPage />
      ) : (
        <Dashboard />
      )}
    </div>
  );
}
