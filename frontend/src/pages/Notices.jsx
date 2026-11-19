import { useState } from "react";
import { api, call } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Empty, Field, Page, useList } from "../components/ui";

export default function Notices() {
  const { user } = useAuth();
  const { data, reload, loading } = useList("/notices?limit=30");
  const blank = { title: "", body: "", isEmergency: false };
  const [f, setF] = useState(blank);
  const post = async (e) => { e.preventDefault(); if (await call(() => api.post("/notices", f), "Published")) { setF(blank); reload(); } };
  const read = async (n) => { if (!n.read && user.role === "resident") { await api.post(`/notices/${n._id}/read`); reload(); } };
  return (
    <Page title="Notices">
      {user.role === "admin" && (
        <form onSubmit={post} className="panel mb-6 space-y-3">
          <Field label="Title" required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          <label className="block text-sm font-medium">Message<textarea required rows={3} className="input mt-1" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isEmergency} onChange={(e) => setF({ ...f, isEmergency: e.target.checked })} />Mark as emergency</label>
          <button className="btn">Publish notice</button>
        </form>)}
      {!loading && !data.length && <Empty>No notices yet.</Empty>}
      <ul className="space-y-3">
        {data.map((n) => (
          <li key={n._id} onClick={() => read(n)} className={`panel cursor-pointer ${n.isEmergency ? "border-l-4 !border-l-saffron" : ""}`}>
            <p className="font-bold">{n.title} {!n.read && user.role === "resident" && <span className="ml-2 rounded-full bg-teal px-2 py-0.5 text-xs text-white">New</span>}</p>
            <p className="mt-1 text-sm">{n.body}</p><p className="mt-2 text-xs text-stone-500">{new Date(n.createdAt).toLocaleDateString()}</p>
          </li>))}
      </ul>
    </Page>
  );
}
