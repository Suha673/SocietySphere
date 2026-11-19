import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Page } from "../components/ui";
const labels = { totalFlats: "Total flats", occupiedFlats: "Occupied flats", residents: "Residents", todaysVisitors: "Visitors today", pendingComplaints: "Open complaints" };
export default function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get("/dashboard/admin").then((r) => setS(r.data.data)); }, []);
  return (
    <Page title="Society overview">
      {!s ? <p className="text-sm">Loading…</p> : (
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(labels).map(([k, l]) => (
            <div key={k} className="panel"><dd className="text-4xl font-extrabold text-teal">{s[k]}</dd><dt className="mt-1 text-sm text-stone-600">{l}</dt></div>))}
        </dl>)}
    </Page>
  );
}
