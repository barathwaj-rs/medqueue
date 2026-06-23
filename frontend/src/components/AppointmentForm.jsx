import React, { useEffect, useState } from "react";

const statusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AppointmentForm({
  doctors = [],
  initialData = null,
  onSubmit,
  onCancel,
}) {
  const [patient, setPatient] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [status, setStatus] = useState("scheduled");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setPatient(initialData.patient?.name || initialData.patient || "");
      setDoctor(initialData.doctor?._id || initialData.doctor || "");

      if (initialData.appointmentDate) {
        const dateValue = new Date(initialData.appointmentDate);
        setDate(dateValue.toISOString().slice(0, 10));
        setTime(dateValue.toTimeString().slice(0, 5));
      } else {
        setDate("");
        setTime("09:00");
      }

      setStatus(initialData.status || "scheduled");
    } else {
      setPatient("");
      setDoctor("");
      setDate("");
      setTime("09:00");
      setStatus("scheduled");
    }
  }, [initialData]);

  const isEditMode = Boolean(initialData);

  function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!patient.trim()) {
      setError("Patient ID is required");
      return;
    }

    if (!doctor) {
      setError("Please select a doctor");
      return;
    }

    if (!date) {
      setError("Please select a date");
      return;
    }

    if (!time) {
      setError("Please select a time");
      return;
    }

    if (isEditMode) {
      setError("Editing appointments is not supported by the current backend.");
      return;
    }

    const appointmentDate = new Date(`${date}T${time}`);
    const now = new Date();
    if (appointmentDate < now) {
      setError("Appointment date and time cannot be in the past.");
      return;
    }

    onSubmit({
      patient: patient.trim(),
      doctor,
      appointmentDate: appointmentDate.toISOString(),
      status,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full min-h-[24rem] flex-col justify-between gap-6 rounded-3xl bg-slate-50 p-6 text-slate-900 shadow-sm shadow-slate-200"
    >
      <div className="space-y-5">
        {isEditMode ? (
          <div className="rounded-3xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
            Appointment editing is unavailable because the backend does not
            expose an update route. You can review details here or create a new
            appointment.
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Patient Information</p>
            <p className="mt-2 text-slate-600">
              Enter the patient details below to schedule an appointment.
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Patient ID
            <input
              value={patient}
              onChange={(e) => {
                setPatient(e.target.value);
                setError("");
              }}
              placeholder="Enter patient ID"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Doctor
            <select
              value={doctor}
              disabled={doctors.length === 0}
              onChange={(e) => {
                setDoctor(e.target.value);
                setError("");
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            >
              <option value="">Select doctor</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.name} — {doc.specialization}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Date
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setError("");
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Time
            <input
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                setError("");
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Status
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setError("");
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-100 p-4 text-red-600">{error}</div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={isEditMode}
          className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white transition duration-200 ${
            isEditMode
              ? "cursor-not-allowed bg-slate-400"
              : "bg-slate-900 hover:bg-slate-800"
          }`}
        >
          {isEditMode ? "Update unavailable" : "Create Appointment"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition duration-200 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
