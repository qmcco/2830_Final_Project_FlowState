import { useState } from "react";
import "./App.css";


export default function RegisterForm({ onAuth, onSwitch }) {
  const [formData, setFormData] = useState({
    uname: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  const validate = () => {
    const errs = {};
    if (!formData.uname) errs.uname = "Username is required";
    else if (!/^.{4,32}$/.test(formData.uname))
      errs.uname = "Username must be between 4 and 32 characters";
    if (!formData.password) errs.password = "Password is required";
    else if (formData.password.length < 5 || formData.password.length > 64)
      errs.password = "Password must be between 5 and 64 characters";
    if (!formData.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
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
      //Placeholder call to register user
      const data = await register({
        uname: formData.uname,
        password: formData.password,
      });
      setApiSuccess("Account created! Signing you in…");
      setTimeout(() => onAuth(data.user), 1000);
    } catch (err) {
      setApiError(err.message || "Registration failed, try again.");
    } 
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2>Create account</h2>
      {apiError && (
        <span>{apiError}</span>
      )}
      {apiSuccess && (
        <span>{apiSuccess}</span>
      )}

      <div>
        <label>Username</label>
        <input
          id="uname"
          type="text"
          placeholder="Username"
          value={formData.uname}
          onChange={handleChange}
          autoComplete="username"
        />
        {errors.uname && <span> {errors.uname}</span>}
      </div>

      <div>
        <label>Password</label>
        <input
          id="password"
          type="text"
          placeholder="Min 5 characters"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
        />
        {errors.password && <span> {errors.password}</span>}
      </div>
      <div>
        <label>Confirm password</label>
        <input
          id="confirmPassword"
          type="text"
          placeholder="Repeat your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
        />
        {errors.confirmPassword && <span> {errors.confirmPassword}</span>}
      </div>
      <button type="submit">Create account</button>
    </form>
  );
}
