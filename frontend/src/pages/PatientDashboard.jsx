import React, { useEffect, useMemo, useState } from "react";
import socket from "../services/socket";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAppointments } from "../services/api";
import { useAuth } from "../context/AuthContext";

const COLORS = ["#0ea5e9", "#10b981", "#f43f5e"];

export default function PatientDashboard() {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      loadData();
    }

    socket.on("appointmentCreated", loadData);
    socket.on("appointmentUpdated", loadData);
    socket.on("appointmentDeleted", loadData);
    socket.on("queueUpdated", loadData);

    return () => {
      socket.off("appointmentCreated", loadData);
      socket.off("appointmentUpdated", loadData);
      socket.off("appointmentDeleted", loadData);
      socket.off("queueUpdated", loadData);
    };
  }, [user]);

  async function loadData() {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const response = await getAppointments();

      const patientAppointments = response.data.filter(
        (appointment) =>
          appointment.patient && appointment.patient._id === user._id,
      );

      setAppointments(patientAppointments);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const scheduled = appointments.filter(
      (a) => a.status === "scheduled",
    ).length;

    const completed = appointments.filter(
      (a) => a.status === "completed",
    ).length;

    const cancelled = appointments.filter(
      (a) => a.status === "cancelled",
    ).length;

    return {
      total: appointments.length,
      scheduled,
      completed,
      cancelled,
    };
  }, [appointments]);

  const upcomingAppointment = appointments
    .filter((a) => a.status === "scheduled")
    .sort(
      (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate),
    )[0];

  const chartData = [
    {
      name: "Scheduled",
      value: stats.scheduled,
    },

    {
      name: "Completed",
      value: stats.completed,
    },

    {
      name: "Cancelled",
      value: stats.cancelled,
    },
  ];

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
        Loading dashboard...
      </div>
    );
  }
  return (
    <main className="space-y-8">
      {error && (
        <div className="rounded-2xl bg-red-100 p-4 text-red-600">{error}</div>
      )}

      <header>
        <h1 className="text-5xl font-bold text-slate-900">
          Welcome back, {user?.name}
        </h1>

        <p className="mt-2 text-slate-500">
          Manage your appointments and track your queue in real time.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-5xl font-bold text-slate-900">{stats.total}</p>

          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-500">
            Total Appointments
          </p>
        </article>

        <article className="rounded-3xl bg-sky-50 p-6 shadow-sm">
          <p className="text-5xl font-bold text-slate-900">{stats.scheduled}</p>

          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-500">
            Upcoming
          </p>
        </article>

        <article className="rounded-3xl bg-emerald-50 p-6 shadow-sm">
          <p className="text-5xl font-bold text-slate-900">{stats.completed}</p>

          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-500">
            Completed
          </p>
        </article>

        <article className="rounded-3xl bg-rose-50 p-6 shadow-sm">
          <p className="text-5xl font-bold text-slate-900">{stats.cancelled}</p>

          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-500">
            Cancelled
          </p>
        </article>
      </div>

      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Upcoming Appointment
        </h2>

        {upcomingAppointment ? (
          <div className="space-y-5">
            <h3 className="text-3xl font-bold text-slate-900">
              Dr. {upcomingAppointment.doctor?.name}
            </h3>

            <p className="text-slate-500">
              {upcomingAppointment.department?.name}
            </p>

            <div className="flex items-center gap-5 mt-6">
              <div className="inline-flex items-center rounded-2xl bg-sky-100 px-5 py-3 text-sky-700 font-semibold">
                Token #{upcomingAppointment.queueNumber}
              </div>

              <div className="rounded-2xl bg-violet-100 px-6 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Estimated Wait
                </p>

                <p className="text-xl font-bold text-violet-700">
                  {upcomingAppointment.estimatedWaitTime} min
                </p>
              </div>
            </div>

            <p className="text-slate-600">
              {new Date(upcomingAppointment.appointmentDate).toLocaleString(
                "en-IN",
                {
                  dateStyle: "long",
                  timeStyle: "short",
                },
              )}
            </p>

            <div className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-emerald-700 font-semibold capitalize">
              {upcomingAppointment.status}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            No upcoming appointments.
          </div>
        )}
      </section>
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="mb-8 text-3xl font-bold text-slate-900">
          Appointment Status
        </h2>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={
                  chartData.some((item) => item.value > 0)
                    ? chartData
                    : [{ name: "No Data", value: 1 }]
                }
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {(chartData.some((item) => item.value > 0)
                  ? chartData
                  : [{ name: "No Data", value: 1 }]
                ).map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </main>
  );
}
