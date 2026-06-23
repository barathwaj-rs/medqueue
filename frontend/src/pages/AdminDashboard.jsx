import React, { useEffect, useState } from "react";
import {
  getDepartments,
  getDoctors,
  getAppointments,
  getPatients,
} from "../services/api";
import {
  Building2,
  Stethoscope,
  Users,
  CalendarDays,
  Clock3,
  BarChart2,
  Check,
} from "lucide-react";

export default function AdminDashboard() {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError("");
      try {
        const [
          departmentsResponse,
          doctorsResponse,
          appointmentsResponse,
          patientsResponse,
        ] = await Promise.all([
          getDepartments(),
          getDoctors(),
          getAppointments(),
          getPatients(),
        ]);

        setDepartments(departmentsResponse.data || []);
        setDoctors(doctorsResponse.data || []);

        const validAppointments = (appointmentsResponse.data || []).filter(
          (appointment) => appointment.patient && appointment.doctor,
        );

        setAppointments(validAppointments);

        setPatients(patientsResponse.data || []);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const now = new Date();
  const dateString = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const getGreeting = () => {
    const hour = now.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const scheduledAppointments = appointments.filter(
    (a) => a.status === "scheduled",
  );

  const averageWait =
    scheduledAppointments.length > 0
      ? Math.round(
          scheduledAppointments.reduce(
            (sum, a) => sum + (a.estimatedWaitTime || 0),
            0,
          ) / scheduledAppointments.length,
        )
      : 0;

  const scheduledCount = appointments.filter(
    (a) => a.status === "scheduled",
  ).length;

  let appointmentLoad = "Low";

  if (scheduledCount >= 10) appointmentLoad = "Moderate";

  if (scheduledCount >= 20) appointmentLoad = "High";

  let queueStatus = "Stable";

  if (scheduledCount > 5) queueStatus = "Busy";

  if (scheduledCount > 15) queueStatus = "Overloaded";

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
        Loading dashboard...
      </div>
    );
  }
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-8">
        {error && (
          <div className="rounded-2xl bg-red-100 p-4 text-red-600">{error}</div>
        )}
        <header className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
                Welcome Admin
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
                Hospital Management Overview
              </h1>
            </div>

            <div className="inline-flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-inner shadow-slate-100">
              <CalendarDays className="h-5 w-5 text-slate-700" />
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900">
                  {dateString}
                </div>
                <div className="mt-0.5 text-xs text-slate-600">
                  {getGreeting()}
                </div>
              </div>
              <Building2 className="ml-3 h-6 w-6 text-slate-700" />
            </div>
          </div>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <span className="rounded-full border-t-4 border-emerald-400 bg-emerald-50 p-1 text-emerald-700">
                <Building2 className="h-4 w-4" />
              </span>
              <div className="text-sm font-semibold text-slate-700">
                Departments
              </div>
            </div>

            <div className="mt-4 text-4xl font-bold text-slate-900">
              {departments.length}
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Total medical departments active in the hospital.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <span className="rounded-full border-t-4 border-cyan-400 bg-cyan-50 p-1 text-cyan-700">
                <Stethoscope className="h-4 w-4" />
              </span>
              <div className="text-sm font-semibold text-slate-700">
                Doctors
              </div>
            </div>

            <div className="mt-4 text-4xl font-bold text-slate-900">
              {doctors.length}
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Doctors currently assigned to care teams and patients.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <span className="rounded-full border-t-4 border-amber-400 bg-amber-50 p-1 text-amber-700">
                <Users className="h-4 w-4" />
              </span>
              <div className="text-sm font-semibold text-slate-700">
                Patients
              </div>
            </div>

            <div className="mt-4 text-4xl font-bold text-slate-900">
              {patients.length}
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Patients currently registered or waiting for consultation.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <span className="rounded-full border-t-4 border-violet-400 bg-violet-50 p-1 text-violet-700">
                <CalendarDays className="h-4 w-4" />
              </span>
              <div className="text-sm font-semibold text-slate-700">
                Appointments
              </div>
            </div>

            <div className="mt-4 text-4xl font-bold text-slate-900">
              {appointments.length}
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Appointments across all departments.
            </p>
          </article>
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Action Center
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-4 rounded-3xl bg-emerald-50 p-3">
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                  <BarChart2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Appointment Load
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {appointmentLoad}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-3xl bg-cyan-50 p-3">
                <div className="rounded-full bg-cyan-100 p-2 text-cyan-700">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Queue Status
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {queueStatus}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-3xl bg-amber-50 p-3">
                <div className="rounded-full bg-amber-100 p-2 text-amber-700">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Available Doctors
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {doctors.filter((doc) => doc.isAvailable).length}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-3xl bg-violet-50 p-3">
                <div className="rounded-full bg-violet-100 p-2 text-violet-700">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Average Waiting Time
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {averageWait} min
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Today's Tasks
            </h2>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-1">
              {[
                {
                  text: "Review doctor schedules",
                  bg: "bg-emerald-50",
                  dot: "bg-emerald-100",
                  icon: Check,
                },
                {
                  text: "Confirm bed availability",
                  bg: "bg-cyan-50",
                  dot: "bg-cyan-100",
                  icon: CalendarDays,
                },
                {
                  text: "Verify appointments",
                  bg: "bg-violet-50",
                  dot: "bg-violet-100",
                  icon: Clock3,
                },
                {
                  text: "Prepare queue board",
                  bg: "bg-amber-50",
                  dot: "bg-amber-100",
                  icon: Building2,
                },
              ].map((task) => {
                const Icon = task.icon;
                return (
                  <li
                    key={task.text}
                    className={`flex items-center gap-3 rounded-2xl p-3 ${task.bg}`}
                  >
                    <span
                      className={`${task.dot} rounded-full p-1 text-slate-700`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm text-slate-700">{task.text}</span>
                  </li>
                );
              })}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
