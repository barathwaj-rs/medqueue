import React from "react";

const statusStyles = {
  scheduled: "bg-sky-100 text-sky-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function PatientAppointmentCard({ appointment, onDelete }) {
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
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                statusStyles[appointment.status] ||
                "bg-slate-100 text-slate-700"
              }`}
            >
              {appointment.status}
            </span>

            <span className="text-sm text-slate-500">
              Booked {new Date(appointment.createdAt).toLocaleDateString()}
            </span>
          </div>
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

      <div className="mt-6 grid gap-4 rounded-3xl bg-slate-50 p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Doctor
          </p>

          <p className="mt-2 text-xl font-semibold text-slate-900">
            Dr. {appointment.doctor?.name || "Not Assigned"}
          </p>

          <p className="text-slate-500">
            {appointment.doctor?.specialization || "Specialization unavailable"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Department
          </p>

          <p className="mt-2 text-xl font-semibold text-slate-900">
            {appointment.department?.name || "No Department"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-3xl bg-slate-50 p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Token Number
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            #{appointment.queueNumber ?? "--"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Estimated Wait
          </p>

          <p className="mt-2 text-3xl font-bold text-black-700">
            {appointment.estimatedWaitTime ?? 0} min
          </p>
        </div>
      </div>

      {onDelete && appointment.status === "scheduled" && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onDelete}
            className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 transition duration-200 hover:bg-rose-50"
          >
            Cancel Appointment
          </button>
        </div>
      )}
    </article>
  );
}
