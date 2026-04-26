import { useState } from "react";
import LandingPage from "./LandingPage";
import LoginForm from "./LoginForm";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);

  const handleAuth = (userData) => {
    setUser(userData);
  };

  return (
    <LandingPage onAuth={handleAuth} />
  );
}
