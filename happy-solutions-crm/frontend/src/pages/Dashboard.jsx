import React, { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [data, setData] = useState({ weekly: {}, monthly: {} });

  useEffect(() => {
    api.get("/dashboard").then(r => setData(r.data)).catch(()=>{});
  }, []);

  const Kpi = ({title, value}) => (
    <div className="card">
      <div style={{ fontSize: 14, color: "#6b7280" }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 800 }}>{value || 0}</div>
    </div>
  );

  return (
    <>
      <div className="header">
        <h2 style={{ margin: 0 }}>Dashboard</h2>
      </div>

      <h3>Weekly</h3>
      <div className="kpi">
        <Kpi title="Leads" value={data.weekly.leads}/>
        <Kpi title="Calls" value={data.weekly.calls}/>
        <Kpi title="Successful Billing" value={data.weekly.successful_billing}/>
        <Kpi title="Follow-ups" value={data.weekly.followups}/>
        <Kpi title="Open" value={(data.weekly.leads || 0) - (data.weekly.successful_billing || 0)}/>
      </div>

      <h3 style={{ marginTop: 20 }}>Monthly</h3>
      <div className="kpi">
        <Kpi title="Leads" value={data.monthly.leads}/>
        <Kpi title="Calls" value={data.monthly.calls}/>
        <Kpi title="Successful Billing" value={data.monthly.successful_billing}/>
        <Kpi title="Follow-ups" value={data.monthly.followups}/>
        <Kpi title="Open" value={(data.monthly.leads || 0) - (data.monthly.successful_billing || 0)}/>
      </div>
    </>
  );
}
