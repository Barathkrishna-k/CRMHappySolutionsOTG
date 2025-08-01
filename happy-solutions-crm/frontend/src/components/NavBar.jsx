import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function NavBar() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="nav">
      <NavLink to="/" end>Dashboard</NavLink>
      <NavLink to="/new">New</NavLink>
      <NavLink to="/followup">Follow Up</NavLink>
      <NavLink to="/database">Database</NavLink>
      <NavLink to="/return-leads">Return Leads</NavLink>
      <span style={{ marginLeft: "auto", color: "#6b7280" }}>
        {role ? `Logged in as: ${role}` : ""}
      </span>
      <button className="btn secondary" onClick={logout}>Logout</button>
    </div>
  );
}
