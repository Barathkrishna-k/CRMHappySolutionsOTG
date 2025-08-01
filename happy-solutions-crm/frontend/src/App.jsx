import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NewQuote from "./pages/NewQuote.jsx";
import FollowUp from "./pages/FollowUp.jsx";
import Database from "./pages/Database.jsx";
import ReturnLeads from "./pages/ReturnLeads.jsx";

function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  const showNav = location.pathname !== "/login";
  return (
    <>
      {showNav && <NavBar />}
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />}/>
          <Route path="/" element={
            <PrivateRoute roles={["MASTER","ADMIN","USER"]}><Dashboard /></PrivateRoute>
          }/>
          <Route path="/new" element={
            <PrivateRoute roles={["MASTER","ADMIN","USER"]}><NewQuote /></PrivateRoute>
          }/>
          <Route path="/followup" element={
            <PrivateRoute roles={["MASTER","ADMIN","USER"]}><FollowUp /></PrivateRoute>
          }/>
          <Route path="/database" element={
            <PrivateRoute roles={["MASTER","ADMIN","USER"]}><Database /></PrivateRoute>
          }/>
          <Route path="/return-leads" element={
            <PrivateRoute roles={["MASTER","ADMIN","USER"]}><ReturnLeads /></PrivateRoute>
          }/>
          <Route path="*" element={<Navigate to="/" replace />}/>
        </Routes>
      </div>
    </>
  );
}
