import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import "./App.css";

export default function LandingPage({ onAuth }) {
  const [mode, setMode] = useState("login");

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setTimeout(() => {setMode(newMode);}, 200);
  };

  return (
    <div>
      <h1>FlowState</h1>
      <main>
          <div>
            <button onClick={() => switchMode("login")}>Sign in</button>
            <button onClick={() => switchMode("register")}>Create account</button>
          </div>
          <div>
            {mode === "login" ? (
              <LoginForm onAuth={onAuth} onSwitch={() => switchMode("register")} />
            ) : (
              <RegisterForm onAuth={onAuth} onSwitch={() => switchMode("login")} />
            )}
          </div>
      </main>
    </div>
  );
}
