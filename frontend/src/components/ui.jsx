import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
export function useList(url, enabled = true) {
  const [data, setData] = useState([]), [loading, setLoading] = useState(enabled);
  const reload = useCallback(async () => {
    if (!enabled) return;
    try { setData((await api.get(url)).data.data); } catch { setData([]); } finally { setLoading(false); }
  }, [url, enabled]);
  useEffect(() => { reload(); }, [reload]);
  return { data, loading, reload };
}
const tone = { approved: "bg-teal-soft text-teal", checked_in: "bg-teal text-white", rejected: "bg-red-100 text-red-800",
  pending: "bg-amber-100 text-amber-800", resolved: "bg-teal-soft text-teal", high: "bg-red-100 text-red-800" };
export const Pill = ({ v }) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${tone[v] || "bg-stone-100 text-stone-700"}`}>{String(v).replace("_", " ")}</span>;
export const Empty = ({ children }) => <p className="py-10 text-center text-sm text-stone-500">{children}</p>;
export const Field = ({ label, ...p }) => <label className="block text-sm font-medium">{label}<input className="input mt-1" {...p} /></label>;
export const Page = ({ title, children }) => <section><h1 className="mb-5 text-2xl font-extrabold">{title}</h1>{children}</section>;
