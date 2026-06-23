import React, { useEffect, useState } from "react";
import socket from "../services/socket";
import {
  getCurrentPatient,
  getRemainingQueue,
  completeCurrentPatient,
  skipCurrentPatient,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function DoctorQueuePage() {
  const { user } = useAuth();

  const [currentPatient, setCurrentPatient] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    socket.on("queueUpdated", loadData);
    socket.on("appointmentCreated", loadData);
    socket.on("appointmentUpdated", loadData);
    socket.on("appointmentDeleted", loadData);

    return () => {
      socket.off("queueUpdated", loadData);
      socket.off("appointmentCreated", loadData);
      socket.off("appointmentUpdated", loadData);
      socket.off("appointmentDeleted", loadData);
    };
  }, [user]);

  async function loadData() {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      let current = null;

      try {
        const currentRes = await getCurrentPatient(user._id);
        current = currentRes.data;
      } catch {
        current = null;
      }

      const queueRes = await getRemainingQueue(user._id);

      setCurrentPatient(current);
      setQueue(queueRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load queue");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    setError("");
    setMessage("");
    if (!user) return;

    if (!window.confirm("Complete consultation for current patient?")) {
      return;
    }

    try {
      await completeCurrentPatient(user._id);

      setMessage("Consultation completed");
      setError("");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Failed to complete consultation",
      );
    }
  }

  async function handleSkip() {
    setError("");
    setMessage("");
    if (!user) return;

    if (!window.confirm("Move current patient to end of queue?")) {
      return;
    }

    try {
      await skipCurrentPatient(user._id);

      setMessage("Patient skipped");
      setError("");
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to skip patient");
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
        Loading queue...
      </div>
    );
  }

  return (
    <main className="space-y-8">
      {error && (
        <div className="rounded-2xl bg-red-100 p-4 text-red-600">{error}</div>
      )}

      {message && (
        <div className="rounded-2xl bg-green-100 p-4 text-green-600">
          {message}
        </div>
      )}
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">
          Current Patient
        </h2>

        {currentPatient ? (
          <div className="space-y-6">
            <div className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sky-700 font-semibold">
              Token #{currentPatient.queueNumber}
            </div>

            <div className="mt-3 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-emerald-700 font-semibold">
              In Consultation
            </div>

            <div>
              <h3 className="text-4xl font-bold text-slate-900">
                {currentPatient.patient?.name}
              </h3>

              <p className="mt-2 text-slate-500">
                {currentPatient.patient?.email}
              </p>
            </div>

            <div className="inline-flex rounded-2xl bg-violet-100 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Estimated Wait
                </p>

                <p className="text-xl font-bold text-violet-700">
                  {currentPatient.estimatedWaitTime} min
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <button
                onClick={handleSkip}
                className="rounded-2xl bg-amber-500 px-8 py-4 font-semibold text-white transition duration-200 hover:bg-amber-600 hover:scale-105"
              >
                Skip Patient
              </button>

              <button
                onClick={handleComplete}
                className="rounded-2xl bg-emerald-600 px-8 py-4 font-semibold text-white transition duration-200 hover:bg-emerald-700 hover:scale-105"
              >
                Complete Consultation
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
            No patient waiting.
          </div>
        )}
      </section>

      <section className="bg-white rounded-3xl p-6 shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Upcoming Queue</h2>

          <div className="rounded-full bg-sky-100 px-4 py-2 text-sky-700 font-semibold">
            {Math.max(queue.length - 1, 0)} waiting
          </div>
        </div>

        <div className="space-y-4">
          {queue.length <= 1 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              No upcoming patients
            </div>
          ) : (
            queue.slice(1).map((patient) => (
              <div
                key={patient._id}
                className="
rounded-3xl
border
border-slate-200
bg-slate-50
p-6
shadow-sm
transition
duration-200
hover:-translate-y-1
hover:shadow-lg
"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sky-700 font-semibold">
                      Token #{patient.queueNumber}
                    </div>

                    <h3 className="mt-4 text-2xl font-bold text-slate-900">
                      {patient.patient?.name}
                    </h3>

                    <p className="mt-1 text-slate-500">
                      {patient.patient?.email}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-violet-100 px-6 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Wait Time
                    </p>

                    <p className="text-xl font-bold text-violet-700">
                      {patient.estimatedWaitTime} min
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
