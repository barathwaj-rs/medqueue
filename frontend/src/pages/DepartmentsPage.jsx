import React, { useEffect, useState } from "react";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../services/api";
import DepartmentCard from "../components/DepartmentCard";
import DepartmentForm from "../components/DepartmentForm";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch departments from backend
  async function loadDepartments() {
    setLoading(true);
    setError("");

    try {
      const res = await getDepartments();
      setDepartments(res.data || []);
    } catch (err) {
      console.error("Failed to load departments", err);

      setError(err.response?.data?.message || "Could not load departments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  // Create a new department
  async function handleCreate(data) {
    setError("");
    setMessage("");

    try {
      await createDepartment({
        name: data.name,
        description: data.description,
      });

      setShowForm(false);
      await loadDepartments();
      setMessage("Department updated successfully");

      setMessage("Department created successfully");
    } catch (err) {
      console.error("Create failed", err);

      setError(err.response?.data?.message || "Failed to create department");
    }
  }

  async function handleUpdate(data) {
    try {
      await updateDepartment(data.id, {
        name: data.name,
        description: data.description,
      });
      setEditing(null);
      setShowForm(false);
      await loadDepartments();
    } catch (err) {
      console.error("Update failed", err);

      setError(err.response?.data?.message || "Failed to update department");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this department?")) return;
    try {
      await deleteDepartment(id);
      await loadDepartments();
      setMessage("Department deleted successfully");
    } catch (err) {
      console.error("Delete failed", err);

      setError(err.response?.data?.message || "Failed to delete department");
    }
  }

  function handleEdit(dept) {
    setEditing(dept);
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
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
              Departments
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">
              Manage Departments
            </h1>
          </div>

          <div>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setShowForm((s) => !s);
              }}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {showForm ? "Close" : "Add Department"}
            </button>
          </div>
        </header>

        {showForm && (
          <div>
            <DepartmentForm
              initialData={editing}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
              onSubmit={(data) =>
                editing ? handleUpdate(data) : handleCreate(data)
              }
            />
          </div>
        )}

        <div>
          {loading ? (
            <div className="text-sm text-slate-600">Loading departments...</div>
          ) : departments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
              No departments yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {departments.map((dept) => (
                <DepartmentCard
                  key={dept._id}
                  department={dept}
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
