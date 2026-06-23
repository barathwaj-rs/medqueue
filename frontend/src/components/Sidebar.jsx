import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Stethoscope,
  CalendarDays,
  Clock3,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const menuItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Departments", to: "/departments", icon: Building2 },
  { label: "Doctors", to: "/doctors", icon: Stethoscope },
  { label: "Appointments", to: "/appointments", icon: CalendarDays },
  { label: "Queue Management", to: "/queue", icon: Clock3 },
  { label: "Patients", to: "/patients", icon: Users },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex sticky top-6 h-[calc(100vh-3rem)] w-full max-w-[16rem] shrink-0 flex-col rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 overflow-y-auto">
      <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          🏥 MedQueue
        </p>

        <h2 className="mt-1 text-base font-semibold text-slate-900">
          Hospital Management System
        </h2>

        <p className="mt-1 text-xs text-slate-600">
          Manage hospital operations efficiently.
        </p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200/40"
                    : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          {/* User */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-lg">
              👤
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-700">
                {user?.name || "Administrator"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user?.email || "admin@medqueue.com"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
