import { createContext, useContext, useEffect, useState } from "react";
import { api, call } from "../services/api";
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null), [loading, setLoading] = useState(true);
  const refresh = async () => { try { setUser((await api.get("/auth/me")).data.data); } catch { setUser(null); } };
  useEffect(() => { refresh().finally(() => setLoading(false)); }, []);
  const submit = async (path, body) => { const r = await call(() => api.post(path, body)); if (r) await refresh(); return !!r; };
  const logout = async () => { await api.post("/auth/logout"); setUser(null); };
  return <Ctx.Provider value={{ user, loading, login: (b) => submit("/auth/login", b), register: (b) => submit("/auth/register-society", b), logout }}>{children}</Ctx.Provider>;
}
