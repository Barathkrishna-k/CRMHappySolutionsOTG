import React, { useEffect, useState } from "react";
import api from "../api";

export default function FollowUp() {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const { data } = await api.get("/followup");
    setRows(data);
  };

  useEffect(()=>{ load(); }, []);

  const confirm = async (id) => {
    await api.post(`/followup/${id}/confirm`);
    load();
  };

  const toReturn = async (id) => {
    const feedback = prompt("Reason/feedback:");
    await api.post(`/followup/${id}/return`, { feedback });
    load();
  };

  return (
    <div>
      <div className="header"><h2>Follow Up</h2></div>
      <div className="card">
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Customer</th><th>Assigned</th><th>Follow @</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r._id}>
                <td><code>{r._id}</code></td>
                <td>{r.details?.customer?.name} — {r.details?.customer?.phone}</td>
                <td>{r.assigned_to_user_email}</td>
                <td>{r.follow_up_at || "-"}</td>
                <td>{r.status}</td>
                <td>
                  <button className="btn" onClick={()=>confirm(r._id)}>Confirm</button>
                  <button className="btn secondary" onClick={()=>toReturn(r._id)} style={{ marginLeft: 6 }}>Return</button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="6">No follow-ups scheduled.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
