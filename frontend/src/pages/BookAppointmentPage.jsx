import React, { useEffect, useState } from "react";
import { getDepartments, getDoctors, createAppointment } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function BookAppointmentPage() {
  const { user } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const departmentRes = await getDepartments();
      const doctorRes = await getDoctors();

      setDepartments(departmentRes.data);
      setDoctors(doctorRes.data);
    } catch (err) {
      console.error(err);
    }
  }

  const filteredDoctors = doctors.filter(
    (doctor) => doctor.department?._id === selectedDepartment,
  );

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!selectedDepartment) {
      setError("Please select a department");
      return;
    }

    if (!selectedDoctor) {
      setError("Please select a doctor");
      return;
    }

    if (!appointmentDate) {
      setError("Please select an appointment date");
      return;
    }

    const selectedDate = new Date(appointmentDate);
    const now = new Date();

    if (selectedDate < now) {
      setError("Cannot book appointments in the past");
      return;
    }

    try {
      const response = await createAppointment({
        patient: user._id,
        doctor: selectedDoctor,
        appointmentDate,
      });
      setMessage(
        `Appointment booked successfully. Token #${response.data.queueNumber}`,
      );
      setError("");

      setSelectedDepartment("");
      setSelectedDoctor("");
      setAppointmentDate("");
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to book appointment");
    }
  }

  return (
    <main className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
          Book Appointment
        </p>

        <h1 className="mt-2 text-5xl font-bold text-slate-900">
          Schedule a Consultation
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white p-8 shadow-sm space-y-6"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Department
          </label>

          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setSelectedDoctor("");
              setError("");
              setMessage("");
            }}
            className="w-full rounded-2xl border border-slate-200 p-4"
          >
            <option value="">Select Department</option>

            {departments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Doctor
          </label>

          <select
            value={selectedDoctor}
            disabled={!selectedDepartment}
            onChange={(e) => {
              setSelectedDoctor(e.target.value);
              setError("");
              setMessage("");
            }}
            className="w-full rounded-2xl border border-slate-200 p-4"
          >
            <option value="">Select Doctor</option>

            {filteredDoctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                Dr. {doctor.name} ({doctor.specialization})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Appointment Date & Time
          </label>

          <input
            type="datetime-local"
            value={appointmentDate}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => {
              setAppointmentDate(e.target.value);
              setError("");
              setMessage("");
            }}
            className="w-full rounded-2xl border border-slate-200 p-4"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {message && (
          <p className="text-sm text-green-600 font-medium">{message}</p>
        )}

        <button
          type="submit"
          className="rounded-2xl bg-sky-600 px-8 py-4 font-semibold text-white hover:bg-sky-700"
        >
          Book Appointment
        </button>
      </form>
    </main>
  );
}
