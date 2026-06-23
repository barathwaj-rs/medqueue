import React from "react";

export default function DepartmentCard({ department, onEdit, onDelete }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {department.name}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {department.description || "No description available"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(department)}
              className="rounded-md bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Edit
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(department._id)}
              className="rounded-md bg-white px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
