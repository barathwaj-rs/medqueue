import { useEffect, useMemo, useRef, useState } from "react";
import socket from "../services/socket";
import { cancelAppointment, getAppointments } from "../services/api";
import AppointmentCard from "../components/AppointmentCard";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const sortOptions = [
  { value: "upcoming", label: "Upcoming" },
  { value: "latest", label: "Latest Appointment" },
];

export default function AppointmentPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("upcoming");
  const [error, setError] = useState("");
  const searchInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    function handleRefresh() {
      loadData();
    }

    socket.on("appointmentCreated", handleRefresh);
    socket.on("appointmentUpdated", handleRefresh);
    socket.on("appointmentDeleted", handleRefresh);
    socket.on("queueUpdated", handleRefresh);

    return () => {
      socket.off("appointmentCreated", handleRefresh);
      socket.off("appointmentUpdated", handleRefresh);
      socket.off("appointmentDeleted", handleRefresh);
      socket.off("queueUpdated", handleRefresh);
    };
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const response = await getAppointments();

      console.log("Appointments from API:", response.data);

      const validAppointments = response.data.filter(
        (appointment) => appointment.patient && appointment.doctor,
      );

      setAppointments(validAppointments);
    } catch (err) {
      console.error("Failed to load appointment data", err);
      setError("Unable to load appointment data.");
    } finally {
      setLoading(false);
    }
  }

  function handleDelete(appointment) {
    setDeleteTarget(appointment);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      const response = await cancelAppointment(deleteTarget._id);

      console.log(response.data);

      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  }

  const statistics = useMemo(() => {
    const scheduled = appointments.filter(
      (item) => item.status === "scheduled",
    ).length;

    const completed = appointments.filter(
      (item) => item.status === "completed",
    ).length;

    const cancelled = appointments.filter(
      (item) => item.status === "cancelled",
    ).length;

    console.log({
      scheduled,
      completed,
      cancelled,
    });

    return {
      total: scheduled + completed + cancelled,
      scheduled,
      completed,
      cancelled,
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = appointments.filter((appointment) => {
      const searchText = [
        appointment.patient?.name,
        appointment.patient?.email,
        typeof appointment.patient === "string" ? appointment.patient : "",
        appointment.doctor?.name,
        appointment.department?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedQuery === "" || searchText.includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" || appointment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const sorted = [...filtered];

    sorted.sort((a, b) => {
      if (sortOption === "latest") {
        return new Date(b.appointmentDate) - new Date(a.appointmentDate);
      }

      return new Date(a.appointmentDate) - new Date(b.appointmentDate);
    });

    return sorted;
  }, [appointments, query, statusFilter, sortOption]);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
                Appointments
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Manage and monitor patient appointments across departments.
              </h1>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_auto]">
            <div className="w-full">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search doctor or department..."
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
              <label className="block text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
                Sort
              </label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() => setStatusFilter(status.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-200 transform ${
                  statusFilter === status.value
                    ? "bg-slate-900 text-white scale-105 shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <p className="text-4xl font-semibold text-slate-900">
              {statistics.total}
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.32em] text-slate-500">
              Total Appointments
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-sky-50 p-6 shadow-sm shadow-slate-200">
            <p className="text-4xl font-semibold text-slate-900">
              {statistics.scheduled}
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.32em] text-sky-700">
              Scheduled
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-emerald-50 p-6 shadow-sm shadow-slate-200">
            <p className="text-4xl font-semibold text-slate-900">
              {statistics.completed}
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.32em] text-emerald-700">
              Completed
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-rose-50 p-6 shadow-sm shadow-slate-200">
            <p className="text-4xl font-semibold text-slate-900">
              {statistics.cancelled}
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.32em] text-rose-700">
              Cancelled
            </p>
          </article>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-600">
            Loading appointments...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm shadow-slate-200">
            <p className="text-lg font-semibold text-slate-900">
              No appointments found
            </p>
            <p className="mt-2 text-sm text-slate-500">
              No appointments are currently available.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                onDelete={() => handleDelete(appointment)}
              />
            ))}
          </div>
        )}
      </section>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Delete Appointment?
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This action cannot be undone. The appointment will be marked as
              cancelled.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
