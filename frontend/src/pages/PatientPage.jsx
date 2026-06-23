import React, { useEffect, useMemo, useState } from "react";
import { getPatients, deletePatient } from "../services/api";
import socket from "../services/socket";

export default function PatientPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const refresh = () => fetchPatients();
    socket.on("appointmentCreated", refresh);
    socket.on("appointmentUpdated", refresh);
    socket.on("appointmentDeleted", refresh);
    socket.on("queueUpdated", refresh);

    return () => {
      socket.off("appointmentCreated", refresh);
      socket.off("appointmentUpdated", refresh);
      socket.off("appointmentDeleted", refresh);
      socket.off("queueUpdated", refresh);
    };
  }, []);

  async function fetchPatients() {
    setLoading(true);
    setError("");

    try {
      const response = await getPatients();
      setPatients(response.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load patients");
    } finally {
      setLoading(false);
    }
  }

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return patients;
    return patients.filter((patient) => {
      const name = patient.name?.toLowerCase() || "";
      const email = patient.email?.toLowerCase() || "";
      return name.includes(query) || email.includes(query);
    });
  }, [patients, search]);

  async function handleDelete() {
    if (!confirmDelete) return;

    setError("");
    setMessage("");

    try {
      await deletePatient(confirmDelete._id);

      setConfirmDelete(null);

      await fetchPatients();

      setMessage("Patient deleted successfully");
    } catch (err) {
      setConfirmDelete(null);
      setError(err?.response?.data?.message || "Failed to delete patient");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      {error && (
        <div className="rounded-2xl bg-red-100 p-4 text-red-600">{error}</div>
      )}

      {message && (
        <div className="rounded-2xl bg-green-100 p-4 text-green-600">
          {message}
        </div>
      )}
      <section className="space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
                Patients
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Manage the patient registry in real time.
              </h1>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_auto]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient by name or email..."
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </header>

        <div className="space-y-6">
          <div className="space-y-6">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
                    Patient list
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    Registered patients
                  </h2>
                </div>
                <div className="text-right text-sm text-slate-500">
                  {filteredPatients.length} patients found
                </div>
              </div>

              {loading ? (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                  Loading patients...
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-600">
                  <p className="text-lg font-semibold text-slate-900">
                    No patients found
                  </p>
                  <p className="mt-2 text-sm">No registered patients found.</p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient._id}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">
                            {patient.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {patient.email}
                          </p>
                          {patient.phone && (
                            <p className="mt-1 text-sm text-slate-600">
                              {patient.phone}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setError("");
                              setMessage("");
                              setConfirmDelete(patient);
                            }}
                            className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            {confirmDelete && (
              <article className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm shadow-rose-100">
                <p className="text-lg font-semibold text-rose-900">
                  Confirm deletion
                </p>
                <p className="mt-2 text-sm text-rose-700">
                  Delete {confirmDelete.name}'s patient record? This cannot be
                  undone.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-2xl bg-rose-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-800"
                  >
                    Yes, delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(null)}
                    className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </article>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
