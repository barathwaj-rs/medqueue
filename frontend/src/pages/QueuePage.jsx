import React, { useEffect, useMemo, useState } from "react";
import socket from "../services/socket";
import {
  getDoctors,
  getRemainingQueue,
  getCurrentPatient,
  cancelAppointment,
  getAppointments,
} from "../services/api";

export default function QueuePage() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedToday, setCompletedToday] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const docs = await getDoctors();
        setDoctors(docs.data || []);
        if ((docs.data || []).length > 0)
          setSelectedDoctor((docs.data || [])[0]);
      } catch (err) {
        console.error("Failed to load doctors", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (!selectedDoctor) return;

    let mounted = true;
    async function loadQueue() {
      try {
        const [remainingRes, currentRes] = await Promise.all([
          getRemainingQueue(selectedDoctor._id),
          getCurrentPatient(selectedDoctor._id),
        ]);

        if (!mounted) return;
        setQueue(remainingRes.data || []);
        setCurrent(currentRes.data || null);
      } catch (err) {
        console.error("Failed to load queue", err);
        setQueue([]);
        setCurrent(null);
      }
    }

    loadQueue();

    const handleQueueUpdated = (updated) => {
      if (!selectedDoctor) return;

      loadQueue();
    };

    socket.on("queueUpdated", handleQueueUpdated);
    socket.on("appointmentCreated", handleQueueUpdated);
    socket.on("appointmentUpdated", handleQueueUpdated);
    socket.on("appointmentDeleted", handleQueueUpdated);

    return () => {
      mounted = false;
      socket.off("queueUpdated", handleQueueUpdated);
      socket.off("appointmentCreated", handleQueueUpdated);
      socket.off("appointmentUpdated", handleQueueUpdated);
      socket.off("appointmentDeleted", handleQueueUpdated);
    };
  }, [selectedDoctor]);

  async function handleCancelAppointment(appointmentId) {
    try {
      await cancelAppointment(appointmentId);
    } catch (err) {
      console.error("Failed to cancel appointment", err);
    }
  }

  const stats = useMemo(() => {
    const waiting = queue.length;
    const currentToken = current?.queueNumber || 0;
    let completedToday = 0;
    let avgWait = 0;

    if (queue.length > 0) {
      const total = queue.reduce((s, a) => s + (a.estimatedWaitTime || 0), 0);
      avgWait = Math.round(total / queue.length);
    }

    return { waiting, currentToken, completedToday, avgWait };
  }, [queue, current]);

  useEffect(() => {
    let mounted = true;
    async function loadCompletedToday() {
      try {
        const res = await getAppointments();
        if (!mounted) return;
        const today = new Date();
        const count = (res.data || []).filter((a) => {
          if (a.doctor?._id !== selectedDoctor?._id) {
            return false;
          }

          if (a.status !== "completed") {
            return false;
          }

          const d = new Date(a.updatedAt || a.createdAt || a.appointmentDate);

          return d.toDateString() === today.toDateString();
        }).length;

        setCompletedToday(count);
      } catch (err) {
        console.error("Failed to load completed today", err);
      }
    }

    loadCompletedToday();
    return () => {
      mounted = false;
    };
  }, [queue, selectedDoctor]);

  if (loading) return <div className="p-6">Loading queue...</div>;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
                Queue Management
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                Live patient queue and token board
              </h1>
            </div>

            <div className="w-72">
              <label className="block text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
                Doctor
              </label>
              <select
                value={selectedDoctor?._id || ""}
                onChange={(e) =>
                  setSelectedDoctor(
                    doctors.find((d) => d._id === e.target.value),
                  )
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
              >
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} — {doc.specialization}{" "}
                    {doc.isAvailable ? "(Available)" : "(Busy)"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-4xl font-semibold text-slate-900">
              {stats.waiting}
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.32em] text-slate-500">
              Waiting Patients
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-4xl font-semibold text-slate-900">
              {stats.currentToken || "-"}
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.32em] text-slate-500">
              Current Token
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-4xl font-semibold text-slate-900">
              {completedToday}
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.32em] text-slate-500">
              Completed Today
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-4xl font-semibold text-slate-900">
              {stats.avgWait}m
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.32em] text-slate-500">
              Avg Waiting Time
            </p>
          </article>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="col-span-2 rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Live Queue</h2>
            <div className="mt-4 space-y-3">
              {queue.length === 0 ? (
                <div className="rounded-xl border border-slate-100 p-4 text-sm text-slate-600">
                  No patients waiting.
                </div>
              ) : (
                queue.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Token {item.queueNumber} —{" "}
                        {item.patient?.name || "Patient"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.patient?.email || ""} •{" "}
                        {item.department?.name || ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCancelAppointment(item._id)}
                        className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-rose-700 ring-1 ring-rose-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <aside className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Current Token
            </h2>
            <div className="mt-4">
              {current ? (
                <div className="rounded-xl border border-slate-100 p-6 text-center">
                  <div className="text-6xl font-bold text-slate-900">
                    {current.queueNumber}
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    {current.patient?.name}
                  </div>
                  <div className="mt-4 text-sm text-slate-600">
                    Currently in consultation
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-100 p-6 text-center text-sm text-slate-600">
                  No current token
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
