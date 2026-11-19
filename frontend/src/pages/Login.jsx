import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Field } from "../components/ui";
export default function Login({ register }) {
  const { login, register: reg } = useAuth();
  const [f, setF] = useState({}), [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => { e.preventDefault(); setBusy(true); await (register ? reg(f) : login(f)); setBusy(false); };
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-end bg-teal p-12 text-white md:flex">
        <p className="text-5xl font-extrabold leading-tight">One register for the whole society.</p>
        <p className="mt-4 max-w-sm opacity-80">Visitors at the gate, complaints on the board, notices everyone sees.</p>
      </div>
      <form onSubmit={submit} className="m-auto w-full max-w-sm space-y-4 p-6">
        <h1 className="text-2xl font-extrabold">{register ? "Register your society" : "Log in"}</h1>
        {register && <>
          <Field label="Society name" required onChange={set("societyName")} />
          <div className="grid grid-cols-2 gap-3"><Field label="City" onChange={set("city")} /><Field label="Pincode" onChange={set("pincode")} /></div>
          <div className="grid grid-cols-2 gap-3"><Field label="Your first name" required onChange={set("firstName")} /><Field label="Last name" onChange={set("lastName")} /></div></>}
        <Field label="Email" type="email" required onChange={set("email")} />
        <Field label={register ? "Password (8+ characters)" : "Password"} type="password" required minLength={register ? 8 : 1} onChange={set("password")} />
        <button className="btn w-full" disabled={busy}>{register ? "Create society" : "Log in"}</button>
        <p className="text-sm">{register ? <>Already registered? <Link className="font-bold underline" to="/login">Log in</Link></> :
          <>New society? <Link className="font-bold underline" to="/register">Register it</Link></>}</p>
      </form>
    </div>
  );
}
