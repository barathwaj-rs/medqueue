import React from "react";

const statusStyles = {
  scheduled: "bg-sky-100 text-sky-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function AppointmentCard({ appointment, onEdit, onDelete }) {
  const appointmentDate = new Date(
    appointment.appointmentDate,
  ).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const appointmentTime = new Date(
    appointment.appointmentDate,
  ).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[appointment.status] || "bg-slate-100 text-slate-700"}`}
            >
              {appointment.status}
            </span>
            <span className="text-sm text-slate-500">
              Booked {new Date(appointment.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h3 className="mt-4 text-xl font-semibold text-slate-900">
            {appointment.patient?.name || appointment.patient || "Patient Name"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {appointment.patient?.email || "No email available"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Appointment
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {appointmentDate}
          </p>
          <p className="text-sm text-slate-600">{appointmentTime}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Doctor
          </div>
          <div className="mt-2 font-semibold text-slate-900">
            Dr {appointment.doctor?.name || "Doctor name"}
          </div>
          <div className="text-slate-500">
            {appointment.doctor?.specialization || "Specialization"}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Department
          </div>
          <div className="mt-2 font-semibold text-slate-900">
            {appointment.department?.name || "Department"}
          </div>
          <div className="text-slate-500">Status: {appointment.status}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Patient Name
          </div>
          <div className="mt-2 font-semibold text-slate-900">
            {appointment.patient?.name || "Patient Name"}
          </div>
          <div className="text-slate-500">
            {appointment.patient?.email || "Patient Email"}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Date
          </div>
          <div className="mt-2 font-semibold text-slate-900">
            {appointmentDate}
          </div>
          <div className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">
            Time
          </div>
          <div className="mt-2 font-semibold text-slate-900">
            {appointmentTime}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="
    rounded-2xl
    bg-white
    px-4
    py-2
    text-sm
    font-semibold
    text-rose-700
    ring-1
    ring-rose-200
    transition
    duration-200
    hover:scale-105
    hover:bg-rose-50
    "
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
