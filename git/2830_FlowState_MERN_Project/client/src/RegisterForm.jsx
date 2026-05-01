import { useState } from "react";
import "./App.css";


export default function RegisterForm({ onAuth, onSwitch }) {
  const [formData, setFormData] = useState({
    uname: "",
    name: "",
    password: "",
    confirmPassword: "",
    email: ""
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  const validate = () => {
    const errs = {};
    if (!formData.uname) errs.uname = "Username is required";
    else if (!/^.{4,32}$/.test(formData.uname))
      errs.uname = "Username must be between 4 and 32 characters";
    if (!formData.name) errs.name = "Name is required";
    else if (!/^.{2,64}$/.test(formData.uname))
      errs.name = "Name must be between 2 and 64 characters";
    if (!formData.email) errs.email = "Email is required";
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email))
      errs.email = "Email must be of proper format";
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
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type':'application/json'
        },
        body: JSON.stringify({
          username: formData.uname,
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();
      setApiSuccess(data.message);
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
        <label>Name</label>
        <input
          id="name"
          type="text"
          placeholder="name"
          value={formData.name}
          onChange={handleChange}
          autoComplete="name"
        />
        {errors.name && <span> {errors.name}</span>}
      </div>

      <div>
        <label>Email</label>
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
