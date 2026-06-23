import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DoctorLayout() {
  const navigate = useNavigate();

  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login");
  }
  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-72 min-h-screen bg-white border-r border-slate-200 p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">🩺 Doctor Panel</h1>

        <nav className="mt-8 space-y-4">
          <Link
            to="/doctor"
            className="block rounded-xl px-4 py-3 hover:bg-slate-100"
          >
            Dashboard
          </Link>

          <Link
            to="/doctor/queue"
            className="block rounded-xl px-4 py-3 hover:bg-slate-100"
          >
            Queue
          </Link>

          <Link
            to="/doctor/appointments"
            className="block rounded-xl px-4 py-3 hover:bg-slate-100"
          >
            Appointments
          </Link>

          <Link
            to="/doctor/profile"
            className="block rounded-xl px-4 py-3 hover:bg-slate-100"
          >
            Profile
          </Link>

          <button
            onClick={handleLogout}
            className="
  block
  w-full
  rounded-xl
  px-4
  py-3
  text-left
  text-rose-600
  hover:bg-rose-50
  "
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
