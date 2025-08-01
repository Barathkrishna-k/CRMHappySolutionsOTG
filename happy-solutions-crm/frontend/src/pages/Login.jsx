import React, { useState } from "react";
import api from "../api";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("master@happy.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const doLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", data.email);
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Login</h2>
        <form onSubmit={doLogin} className="grid">
          <div>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/>
          </div>
          {error && <div style={{ color: "#ff3333" }}>{error}</div>}
          <button className="btn" type="submit">Sign in</button>
        </form>
        <p style={{ color: "#6b7280", fontSize: 12, marginTop: 12 }}>
          Tip: run <code>python seed.py</code> before login.
        </p>
      </div>
    </div>
  );
}
