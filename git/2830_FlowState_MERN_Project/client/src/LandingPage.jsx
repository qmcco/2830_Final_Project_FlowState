import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import "./App.css";

export default function LandingPage() {
  const [mode, setMode] = useState("login");

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setTimeout(() => {setMode(newMode);}, 200);
  };

  return (
    <div>
      <h1>FlowState</h1>
      <main>
          <div className="landingbar">
            <button className="landingbutton" onClick={() => switchMode("login")}>Sign in</button>
            <button className="landingbutton" onClick={() => switchMode("register")}>Create account</button>
          </div>
          <div>
            {mode === "login" ? (
              <LoginForm />
            ) : (
              <RegisterForm />
            )}
          </div>
      </main>
    </div>
  );
}
