import React, { useEffect, useState } from "react";
import api from "../api";

export default function ReturnLeads() {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const { data } = await api.get("/leads?status=RETURNED");
    setRows(data);
  };

  useEffect(()=>{ load(); }, []);

  return (
    <>
      <div className="header"><h2>Return Leads</h2></div>
      <div className="card">
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Customer</th><th>Feedback</th><th>Assigned</th></tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r._id}>
                <td><code>{r._id}</code></td>
                <td>{r.details?.customer?.name} — {r.details?.customer?.phone}</td>
                <td>{r.feedback || "-"}</td>
                <td>{r.assigned_to_user_email}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="4">No return leads.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
