import React, { useEffect, useState } from "react";
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

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    waitingPatients: 0,
    completedToday: 0,
    avgWait: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      setError("");
      try {
        const res = await getAppointments();
        const appointments = (res.data || []).filter(
          (appointment) =>
            appointment.doctor && appointment.doctor._id === user?._id,
        );

        const today = new Date();

        const todayAppointments = appointments.filter((a) => {
          const d = new Date(a.appointmentDate);
          return d.toDateString() === today.toDateString();
        });

        const waitingPatients = todayAppointments.filter(
          (a) => a.status === "scheduled",
        ).length;

        const completedToday = todayAppointments.filter(
          (a) => a.status === "completed",
        ).length;

        const avgWait =
          todayAppointments.length > 0
            ? Math.round(
                todayAppointments.reduce(
                  (sum, a) => sum + (a.estimatedWaitTime || 0),
                  0,
                ) / todayAppointments.length,
              )
            : 0;

        setStats({
          todayAppointments: todayAppointments.length,
          waitingPatients,
          completedToday,
          avgWait,
        });

        const cancelled = todayAppointments.filter(
          (a) => a.status === "cancelled",
        ).length;

        setChartData([
          {
            name: "Scheduled",
            value: waitingPatients,
          },
          {
            name: "Completed",
            value: completedToday,
          },
          {
            name: "Cancelled",
            value: cancelled,
          },
        ]);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
        setError("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    }

    loadStats();

    socket.on("appointmentCreated", loadStats);
    socket.on("appointmentUpdated", loadStats);
    socket.on("appointmentDeleted", loadStats);
    socket.on("queueUpdated", loadStats);

    return () => {
      socket.off("appointmentCreated", loadStats);
      socket.off("appointmentUpdated", loadStats);
      socket.off("appointmentDeleted", loadStats);
      socket.off("queueUpdated", loadStats);
    };
  }, []);
  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
        Loading dashboard...
      </div>
    );
  }
  return (
    <main className="space-y-6">
      {error && (
        <div className="rounded-2xl bg-red-100 p-4 text-red-600">{error}</div>
      )}
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
          Welcome Doctor
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-slate-700">
          Dr. {user?.name}
        </h2>

        <h1 className="mt-4 text-6xl font-bold text-slate-900">
          Doctor Dashboard
        </h1>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-5xl font-bold text-slate-900">
            {stats.todayAppointments}
          </p>

          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-500">
            Today's Appointments
          </p>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-5xl font-bold text-slate-900">
            {stats.waitingPatients}
          </p>

          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-500">
            Waiting Patients
          </p>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-5xl font-bold text-slate-900">
            {stats.completedToday}
          </p>

          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-500">
            Completed Today
          </p>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-5xl font-bold text-slate-900">{stats.avgWait}m</p>

          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-500">
            Average Wait Time
          </p>
        </article>
      </div>
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="mb-8 text-3xl font-bold text-slate-900">
          Appointment Status
        </h2>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={
                  chartData.length ? chartData : [{ name: "No Data", value: 1 }]
                }
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {(chartData.length
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
