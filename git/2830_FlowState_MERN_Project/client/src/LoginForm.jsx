import { useState } from "react";
import "./App.css";

export default function LoginForm({ onAuth, onSwitch }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");


  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = "Email is required";
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email))
      errs.email = "Email must be of proper format";
    if (!formData.password) errs.password = "Password is required";
    else if (formData.password.length < 5 || formData.password.length > 64)
      errs.password = "Password must be between 5 and 64 characters";
    return errs;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setApiError("");

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type':'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials, try again.");
      }

      if (!data.user) {
        throw new Error("Login succeeded, but no user information was returned.");
      }

      onAuth(data.user);
      setApiSuccess(data.message);
    } catch (err) {
      setApiError(err.message || "Invalid credentials, try again.");
    } 
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <h2>Welcome</h2>
      {apiError && (
        <span>{apiError}</span>
      )}
      {apiSuccess && (
        <span>{apiSuccess}</span>
      )}
      
      <div className="inputform">
        <div>
          <label className="inputlabel">Email </label>
          <input
            id="email"
            type="text"
            placeholder="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />
          {errors.email && <span> {errors.email}</span>}
        </div>
        <div>
          <label className="inputlabel">Password </label>
          <input
            type="text"
            id="password"
            placeholder="******"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
          {errors.password && <span> {errors.password}</span>}
        </div>
      </div>
      <button type="submit">Sign in</button>
    </form>
  );
}
