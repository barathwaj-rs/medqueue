import React, { useState, useEffect } from "react";

export default function DepartmentForm({
  initialData = null,
  onCancel,
  onSubmit,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
    } else {
      setName("");
      setDescription("");
    }

    setError("");
  }, [initialData]);

  function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Department name is required");
      return;
    }

    if (name.trim().length < 3) {
      setError("Department name must contain at least 3 characters");
      return;
    }

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (description.trim().length < 5) {
      setError("Description must contain at least 5 characters");
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      id: initialData?._id,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200"
    >
      <h3 className="text-sm font-semibold text-slate-900">
        {initialData ? "Edit Department" : "Add Department"}
      </h3>

      <div className="mt-3 grid gap-3">
        <label className="text-xs text-slate-600">Name</label>
        <input
          value={name}
          maxLength={50}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
          placeholder="e.g. Cardiology"
        />

        <label className="text-xs text-slate-600">Description</label>
        <textarea
          value={description}
          maxLength={200}
          onChange={(e) => {
            setDescription(e.target.value);
            setError("");
          }}
          className="min-h-[80px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
          placeholder="Short description of the department"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="mt-2 flex items-center gap-2">
          <button
            type="submit"
            disabled={!name.trim() || !description.trim()}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {initialData ? "Update" : "Create"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
