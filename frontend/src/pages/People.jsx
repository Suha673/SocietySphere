import { useState } from "react";
import { api, call } from "../services/api";
import { Field, Page, useList } from "../components/ui";

export default function People() {
  const buildings = useList("/buildings?limit=50"), flats = useList("/flats?limit=50"), users = useList("/users?limit=50");
  const [b, setB] = useState(""), [fl, setFl] = useState({ buildingId: "", flatNumber: "" });
  const [u, setU] = useState({ firstName: "", email: "", role: "resident", flatId: "" }), [temp, setTemp] = useState(null);
  const addB = async (e) => { e.preventDefault(); if (await call(() => api.post("/buildings", { name: b }), "Building added")) { setB(""); buildings.reload(); } };
  const addF = async (e) => { e.preventDefault(); if (await call(() => api.post("/flats", fl), "Flat added")) { setFl({ ...fl, flatNumber: "" }); flats.reload(); } };
  const invite = async (e) => {
    e.preventDefault();
    const r = await call(() => api.post("/users/invite", { ...u, flatId: u.role === "resident" ? u.flatId : undefined }), "Person added");
    if (r) { setTemp(r.data); users.reload(); }
  };
  return (
    <Page title="Society setup">
      <div className="grid gap-4 md:grid-cols-2">
        <form onSubmit={addB} className="panel space-y-3"><h2 className="font-bold">1. Add a building</h2>
          <Field label="Building or block name" required value={b} onChange={(e) => setB(e.target.value)} /><button className="btn">Add building</button></form>
        <form onSubmit={addF} className="panel space-y-3"><h2 className="font-bold">2. Add a flat</h2>
          <label className="block text-sm font-medium">Building<select required className="input mt-1" value={fl.buildingId} onChange={(e) => setFl({ ...fl, buildingId: e.target.value })}>
            <option value="">Choose</option>{buildings.data.map((x) => <option key={x._id} value={x._id}>{x.name}</option>)}</select></label>
          <Field label="Flat number" required value={fl.flatNumber} onChange={(e) => setFl({ ...fl, flatNumber: e.target.value })} /><button className="btn">Add flat</button></form>
        <form onSubmit={invite} className="panel space-y-3 md:col-span-2"><h2 className="font-bold">3. Add a person</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="First name" required value={u.firstName} onChange={(e) => setU({ ...u, firstName: e.target.value })} />
            <Field label="Email" type="email" required value={u.email} onChange={(e) => setU({ ...u, email: e.target.value })} />
            <label className="text-sm font-medium">Role<select className="input mt-1" value={u.role} onChange={(e) => setU({ ...u, role: e.target.value })}>{["resident", "guard", "staff", "accountant"].map((r) => <option key={r}>{r}</option>)}</select></label>
            {u.role === "resident" && <label className="text-sm font-medium">Flat<select required className="input mt-1" value={u.flatId} onChange={(e) => setU({ ...u, flatId: e.target.value })}>
              <option value="">Choose</option>{flats.data.map((x) => <option key={x._id} value={x._id}>{x.flatNumber}</option>)}</select></label>}
          </div>
          <button className="btn">Add person</button>
          {temp && <p className="rounded-md bg-teal-soft p-3 text-sm">Share these login details now: <b>{temp.email}</b> / <b>{temp.tempPassword}</b>. The password is shown only once.</p>}
        </form>
      </div>
      <h2 className="mb-2 mt-8 font-bold">People ({users.data.length})</h2>
      <ul className="divide-y divide-line rounded-lg border border-line bg-white">
        {users.data.map((x) => <li key={x._id} className="flex justify-between px-4 py-2.5 text-sm"><span>{x.firstName} · {x.email}</span><span className="text-stone-500">{x.role}</span></li>)}
      </ul>
    </Page>
  );
}
