import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Shell, { NAV } from "./components/Shell";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Visitors from "./pages/Visitors";
import Complaints from "./pages/Complaints";
import Notices from "./pages/Notices";
import People from "./pages/People";

function Protected({ roles }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8 text-sm">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Shell />;
}
function Home() {
  const { user } = useAuth();
  const first = NAV[user?.role]?.[0]?.[0];
  return <Navigate to={first || "/login"} replace />;
}
export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Home /> : <Login />} />
      <Route path="/register" element={user ? <Home /> : <Login register />} />
      <Route element={<Protected roles={["admin"]} />}>
        <Route path="/dashboard" element={<Dashboard />} /><Route path="/people" element={<People />} />
      </Route>
      <Route element={<Protected roles={["admin", "resident", "guard"]} />}><Route path="/visitors" element={<Visitors />} /></Route>
      <Route element={<Protected roles={["admin", "resident", "staff"]} />}><Route path="/complaints" element={<Complaints />} /></Route>
      <Route element={<Protected roles={["admin", "resident"]} />}><Route path="/notices" element={<Notices />} /></Route>
      <Route path="*" element={user ? <Home /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}
