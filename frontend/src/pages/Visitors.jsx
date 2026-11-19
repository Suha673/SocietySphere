import { useState } from "react";
import { api, call } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Empty, Field, Page, Pill, useList } from "../components/ui";

export default function Visitors() {
  const { user } = useAuth();
  const gate = user.role !== "resident";
  const { data, reload, loading } = useList("/visitors?limit=30");
  const flats = useList("/flats?limit=50", gate);
  const blank = { visitorName: "", purpose: "", phone: "", flatId: "" };
  const [f, setF] = useState(blank);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const add = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(Object.entries(f).filter(([, v]) => v));
    if (await call(() => api.post("/visitors", body), gate ? "Sent to resident for approval" : "Visitor added")) { setF(blank); reload(); }
  };
  const act = async (id, what) => { if (await call(() => api.patch(`/visitors/${id}/${what}`))) reload(); };
  const big = "btn !px-5 !py-3";
  return (
    <Page title={user.role === "guard" ? "Gate" : "Visitors"}>
      <form onSubmit={add} className="panel mb-6 grid gap-3 sm:grid-cols-2">
        <Field label="Visitor name" required value={f.visitorName} onChange={set("visitorName")} />
        <Field label="Phone" value={f.phone} onChange={set("phone")} />
        <Field label="Purpose" value={f.purpose} onChange={set("purpose")} />
        {gate && <label className="text-sm font-medium">Flat
          <select required className="input mt-1" value={f.flatId} onChange={set("flatId")}>
            <option value="">Choose a flat</option>{flats.data.map((x) => <option key={x._id} value={x._id}>{x.flatNumber}</option>)}</select></label>}
        <button className="btn sm:col-span-2">{gate ? "Request entry" : "Pre-approve visitor"}</button>
      </form>
      {!loading && !data.length && <Empty>No visitors yet. Add one above.</Empty>}
      <ul className="space-y-3">
        {data.map((v) => (
          <li key={v._id} className="panel flex flex-wrap items-center justify-between gap-3">
            <div><p className="font-bold">{v.visitorName}</p><p className="text-sm text-stone-600">{v.purpose || "No purpose given"} · {new Date(v.createdAt).toLocaleString()}</p></div>
            <div className="flex items-center gap-2"><Pill v={v.status} />
              {v.status === "pending" && user.role !== "guard" && <><button className={big} onClick={() => act(v._id, "approve")}>Approve</button><button className="btn-alt" onClick={() => act(v._id, "reject")}>Reject</button></>}
              {v.status === "approved" && gate && <button className={big} onClick={() => act(v._id, "check-in")}>Check in</button>}
              {v.status === "checked_in" && gate && <button className={big} onClick={() => act(v._id, "check-out")}>Check out</button>}
            </div>
          </li>))}
      </ul>
    </Page>
  );
}
