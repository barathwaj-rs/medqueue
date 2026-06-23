import React from "react";

export default function DoctorCard({ doctor, onEdit, onDelete }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {doctor.name}
          </h3>
          <p className="mt-1 text-xs text-slate-600">{doctor.specialization}</p>
          <p className="mt-2 text-sm text-slate-600">
            {doctor.department?.name || "No Department"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Experience: {doctor.experience ?? 0} years
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(doctor)}
            className="rounded-md bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete?.(doctor._id)}
            className="rounded-md bg-white px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
