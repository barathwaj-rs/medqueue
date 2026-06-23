import React, { useEffect, useState } from "react";
import {
  getDoctors,
  getDepartments,
  deleteDoctor,
  updateDoctor,
} from "../services/api";
import DoctorCard from "../components/DoctorCard";
import DoctorForm from "../components/DoctorForm";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [docRes, depRes] = await Promise.all([
        getDoctors(),
        getDepartments(),
      ]);
      setDoctors(docRes.data || []);
      setDepartments(depRes.data || []);
    } catch (err) {
      console.error("Failed to load doctors or departments", err);

      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleUpdate(data) {
    setError("");
    setMessage("");

    try {
      await updateDoctor(data.id, data);

      setEditing(null);
      setShowForm(false);

      await loadData();

      setMessage("Doctor updated successfully");
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to update doctor");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this doctor?")) return;

    setError("");
    setMessage("");

    try {
      await deleteDoctor(id);

      await loadData();

      setMessage("Doctor deleted successfully");
    } catch (err) {
      console.error("Delete doctor failed", err);

      setError(err.response?.data?.message || "Failed to delete doctor");
    }
  }

  function handleEdit(doctor) {
    setEditing(doctor);
    setShowForm(true);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-6">
        {error && (
          <div className="rounded-2xl bg-red-100 p-4 text-red-600">{error}</div>
        )}

        {message && (
          <div className="rounded-2xl bg-green-100 p-4 text-green-600">
            {message}
          </div>
        )}
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            DOCTORS
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Manage Doctors
          </h1>

          <p className="mt-2 text-slate-500">
            View and update doctors in the hospital.
          </p>
        </header>

        {showForm && editing && (
          <DoctorForm
            initialData={editing}
            departments={departments}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
            onSubmit={handleUpdate}
          />
        )}
        <div>
          {loading ? (
            <div className="text-sm text-slate-600">Loading doctors...</div>
          ) : doctors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
              No doctors yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doc) => (
                <DoctorCard
                  key={doc._id}
                  doctor={doc}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
