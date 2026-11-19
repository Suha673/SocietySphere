import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export const NAV = {
  admin: [["/dashboard", "Dashboard"], ["/visitors", "Visitors"], ["/complaints", "Complaints"], ["/notices", "Notices"], ["/people", "Society setup"]],
  resident: [["/visitors", "My visitors"], ["/complaints", "My complaints"], ["/notices", "Notices"]],
  guard: [["/visitors", "Gate"]],
  staff: [["/complaints", "My work"]],
};
export default function Shell() {
  const { user, logout } = useAuth();
  const links = NAV[user.role] || [];
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-teal p-4 text-white md:w-60 md:min-h-screen">
        <p className="mb-1 text-xl font-extrabold">SocietySphere</p>
        <p className="mb-5 text-sm opacity-70">{user.firstName} · {user.role}</p>
        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-white text-teal" : "hover:bg-white/10"}`}>{label}</NavLink>))}
          <button onClick={logout} className="rounded-md px-3 py-2 text-left text-sm opacity-80 hover:bg-white/10 md:mt-8">Log out</button>
        </nav>
      </aside>
      <main className="mx-auto w-full max-w-5xl p-4 md:p-8"><Outlet /></main>
    </div>
  );
}
