import React, { useState, useEffect } from "react";

export default function DoctorForm({
  initialData = null,
  departments = [],
  onCancel,
  onSubmit,
}) {
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [department, setDepartment] = useState("");
  const [experience, setExperience] = useState(0);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setSpecialization(initialData.specialization || "");
      setDepartment(
        initialData.department?._id || initialData.department || "",
      );
      setExperience(initialData.experience ?? 0);
      setEmail(initialData.email || "");
      setPhone(initialData.phone || "");
    } else {
      setName("");
      setSpecialization("");
      setDepartment("");
      setExperience(0);
      setEmail("");
      setPhone("");
    }
    setError("");
  }, [initialData]);

  function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Doctor name is required");
      return;
    }

    if (name.trim().length < 3) {
      setError("Doctor name must contain at least 3 characters");
      return;
    }

    if (!specialization.trim()) {
      setError("Specialization is required");
      return;
    }

    if (!department) {
      setError("Please select a department");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setError("Invalid email address");
      return;
    }

    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    const phonePattern = /^\+?[0-9\s-]{7,20}$/;

    if (!phonePattern.test(phone.trim())) {
      setError("Invalid phone number");
      return;
    }

    if (
      experience === "" ||
      Number(experience) < 0 ||
      Number(experience) > 60
    ) {
      setError("Experience must be between 0 and 60 years");
      return;
    }

    onSubmit({
      name: name.trim(),
      specialization: specialization.trim(),
      department,
      experience: Number(experience),
      email: email.trim(),
      phone: phone.trim(),
      id: initialData?._id,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200"
    >
      <h3 className="text-sm font-semibold text-slate-900">
        {initialData ? "Edit Doctor" : "Add Doctor"}
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
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400"
          placeholder="Full name"
        />

        <label className="text-xs text-slate-600">Specialization</label>
        <input
          value={specialization}
          maxLength={50}
          onChange={(e) => {
            setSpecialization(e.target.value);
            setError("");
          }}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400"
          placeholder="e.g. Cardiology"
        />

        <label className="text-xs text-slate-600">Department</label>
        <select
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setError("");
          }}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
        >
          <option value="">Select department</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>

        <label className="text-xs text-slate-600">Experience (years)</label>
        <input
          type="number"
          min="0"
          max="60"
          value={experience}
          onChange={(e) => {
            setExperience(e.target.value);
            setError("");
          }}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
        />

        <label className="text-xs text-slate-600">Email</label>
        <input
          value={email}
          maxLength={100}
          placeholder="doctor@example.com"
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400"
        />

        <label className="text-xs text-slate-600">Phone</label>
        <input
          value={phone}
          maxLength={20}
          placeholder="+91 9876543210"
          onChange={(e) => {
            setPhone(e.target.value);
            setError("");
          }}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="mt-2 flex items-center gap-2">
          <button
            type="submit"
            disabled={
              !name.trim() ||
              !specialization.trim() ||
              !department ||
              !email.trim() ||
              !phone.trim()
            }
            className={`rounded-md px-4 py-2 text-sm font-semibold text-white ${
              !name.trim() ||
              !specialization.trim() ||
              !department ||
              !email.trim() ||
              !phone.trim()
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-slate-900 hover:bg-slate-800"
            }`}
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
