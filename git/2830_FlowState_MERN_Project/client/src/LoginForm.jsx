import { useState } from "react";
import "./App.css";

export default function LoginForm({ onAuth, onSwitch }) {
  const [formData, setFormData] = useState({ uname: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");


  const validate = () => {
    const errs = {};
    if (!formData.uname) errs.uname = "Username is required";
    else if (!/^[a-zA-Z0-9_]{4,32}$/.test(formData.uname))
      errs.uname = "Enter a valid username";
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
      const data = await login(formData.uname, formData.password);
      onAuth(data.user);
    } catch (err) {
      setApiError(err.message || "Invalid credentials, try again.");
    } 
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2>Welcome</h2>
      <div>
        <label>Username</label>
        <input
          id="uname"
          type="text"
          placeholder="username"
          value={formData.uname}
          onChange={handleChange}
          autoComplete="username"
        />
        {errors.uname && <span> {errors.uname}</span>}
      </div>
      <div>
        <label>Password</label>
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
      <button type="submit">Sign in</button>
    </form>
  );
}
