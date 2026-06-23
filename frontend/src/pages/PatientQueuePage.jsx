import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import socket from "../services/socket";
import { getPatientQueue } from "../services/api";

export default function PatientQueuePage() {
  const { user } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [patientsAhead, setPatientsAhead] = useState(0);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    function handleRefresh() {
      loadData();
    }

    socket.on("queueUpdated", handleRefresh);
    socket.on("appointmentUpdated", handleRefresh);
    socket.on("appointmentDeleted", handleRefresh);

    return () => {
      socket.off("queueUpdated", handleRefresh);
      socket.off("appointmentUpdated", handleRefresh);
      socket.off("appointmentDeleted", handleRefresh);
    };
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const response = await getPatientQueue(user._id);

      setAppointment(response.data.appointment);
      setCurrentPatient(response.data.currentPatient);
      setPatientsAhead(response.data.patientsAhead);
      setQueue(response.data.queue);
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to load queue");

      setAppointment(null);
      setCurrentPatient(null);
      setPatientsAhead(0);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="space-y-8">
        {error && (
          <div className="rounded-2xl bg-red-100 p-4 text-red-600">{error}</div>
        )}
        <section className="rounded-3xl bg-white p-10 shadow-sm text-center text-slate-500">
          Loading queue...
        </section>
      </main>
    );
  }

  if (!appointment) {
    return (
      <main className="space-y-8">
        <section className="rounded-3xl bg-white p-10 shadow-sm text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            No Active Appointment
          </h2>

          <p className="mt-4 text-slate-500">
            Book an appointment to join the queue.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">
          Current Consultation
        </h2>

        {currentPatient ? (
          <div className="space-y-6">
            <div className="flex gap-3">
              <div className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sky-700 font-semibold">
                Token #{currentPatient.queueNumber}
              </div>

              <div className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-emerald-700 font-semibold">
                In Consultation
              </div>
            </div>

            <div>
              <h3 className="text-4xl font-bold text-slate-900">
                {currentPatient.patient?.name}
              </h3>

              <p className="mt-2 text-slate-500">
                {currentPatient.patient?.email}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            No patient currently being consulted.
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">
          Your Queue Status
        </h2>

        <p className="text-slate-500 mb-8">Dr. {appointment.doctor?.name}</p>

        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl bg-sky-50 p-6 shadow-sm">
            <p className="text-5xl font-bold text-slate-900">
              #{appointment.queueNumber}
            </p>

            <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-500">
              Your Token
            </p>
          </article>

          <article className="rounded-3xl bg-amber-50 p-6 shadow-sm">
            <p className="text-5xl font-bold text-slate-900">{patientsAhead}</p>

            <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-500">
              Patients Ahead
            </p>
          </article>

          <article className="rounded-3xl bg-violet-50 p-6 shadow-sm">
            <p className="text-5xl font-bold text-slate-900">
              {appointment.estimatedWaitTime}m
            </p>

            <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-500">
              Estimated Wait
            </p>
          </article>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Queue Progress</h2>

          <div className="rounded-full bg-sky-100 px-4 py-2 text-sky-700 font-semibold">
            {queue.length} patients
          </div>
        </div>

        <div className="space-y-4">
          {queue.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              Queue is empty
            </div>
          ) : (
            queue.map((item) => (
              <div
                key={item._id}
                className={`
      rounded-3xl
      border
      p-6
      shadow-sm
      transition
      duration-200
      hover:-translate-y-1
      hover:shadow-lg
      ${
        item.patient?._id === user._id
          ? "border-violet-300 bg-violet-50"
          : "border-slate-200 bg-slate-50"
      }
    `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sky-700 font-semibold">
                      Token #{item.queueNumber}
                    </div>

                    <h3 className="mt-4 text-2xl font-bold text-slate-900">
                      {item.patient?.name}
                    </h3>
                  </div>

                  {item._id === currentPatient?._id ? (
                    <div className="rounded-full bg-emerald-100 px-4 py-2 text-emerald-700 font-semibold">
                      In Consultation
                    </div>
                  ) : item.patient?._id === user._id ? (
                    <div className="rounded-full bg-violet-100 px-4 py-2 text-violet-700 font-semibold">
                      You
                    </div>
                  ) : (
                    <div className="rounded-full bg-slate-100 px-4 py-2 text-slate-600 font-semibold">
                      Waiting
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
