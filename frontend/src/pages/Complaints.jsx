import { useState } from "react";
import { api, call } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Empty, Field, Page, Pill, useList } from "../components/ui";
const cats = ["electricity", "plumbing", "cleaning", "security", "other"];

export default function Complaints() {
  const { user } = useAuth();
  const { data, reload, loading } = useList("/complaints?limit=30");
  const staff = useList("/users?role=staff&limit=50", user.role === "admin");
  const blank = { title: "", description: "", category: "other", priority: "medium" };
  const [f, setF] = useState(blank);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const add = async (e) => { e.preventDefault(); if (await call(() => api.post("/complaints", f), "Complaint raised")) { setF(blank); reload(); } };
  const status = async (id, s) => { if (await call(() => api.patch(`/complaints/${id}/status`, { status: s }))) reload(); };
  const assign = async (id, staffId) => { if (staffId && await call(() => api.patch(`/complaints/${id}/assign`, { staffId }), "Assigned")) reload(); };
  const step = { assigned: ["in_progress", "Start work"], in_progress: ["resolved", "Mark resolved"] };
  return (
    <Page title={user.role === "staff" ? "My work" : "Complaints"}>
      {user.role === "resident" && (
        <form onSubmit={add} className="panel mb-6 grid gap-3 sm:grid-cols-2">
          <Field label="What is the problem?" required minLength={3} value={f.title} onChange={set("title")} />
          <Field label="Details" value={f.description} onChange={set("description")} />
          <label className="text-sm font-medium">Category<select className="input mt-1" value={f.category} onChange={set("category")}>{cats.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="text-sm font-medium">Priority<select className="input mt-1" value={f.priority} onChange={set("priority")}>{["low", "medium", "high"].map((c) => <option key={c}>{c}</option>)}</select></label>
          <button className="btn sm:col-span-2">Raise complaint</button>
        </form>)}
      {!loading && !data.length && <Empty>No complaints. Everything is working.</Empty>}
      <ul className="space-y-3">
        {data.map((c) => (
          <li key={c._id} className="panel">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><p className="font-bold">{c.title}</p><p className="text-sm text-stone-600">{c.category} · {c.description || "No details"}</p></div>
              <div className="flex gap-2"><Pill v={c.priority} /><Pill v={c.status} /></div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {user.role === "admin" && ["pending", "assigned"].includes(c.status) && (
                <select className="input !w-auto" defaultValue="" onChange={(e) => assign(c._id, e.target.value)}>
                  <option value="">Assign staff…</option>{staff.data.map((s) => <option key={s._id} value={s._id}>{s.firstName}</option>)}</select>)}
              {["staff", "admin"].includes(user.role) && step[c.status] && <button className="btn" onClick={() => status(c._id, step[c.status][0])}>{step[c.status][1]}</button>}
              {user.role === "resident" && c.status === "resolved" && <><button className="btn" onClick={() => status(c._id, "closed")}>Confirm fixed</button><button className="btn-alt" onClick={() => status(c._id, "pending")}>Reopen</button></>}
            </div>
          </li>))}
      </ul>
    </Page>
  );
}
