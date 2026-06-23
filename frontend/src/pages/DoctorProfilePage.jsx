import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getDoctorById, updateDoctor } from "../services/api";

export default function DoctorProfilePage() {
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    phone: "",
    experience: 0,
    isAvailable: true,
  });

  useEffect(() => {
    if (user) {
      loadDoctor();
    }
  }, [user]);

  async function loadDoctor() {
    try {
      const response = await getDoctorById(user._id);

      setDoctor(response.data);

      setFormData({
        phone: response.data.phone,
        experience: response.data.experience,
        isAvailable: response.data.isAvailable,
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    const phonePattern = /^\+?[0-9\s-]{7,20}$/;

    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return;
    }

    if (!phonePattern.test(formData.phone.trim())) {
      setError("Invalid phone number");
      return;
    }

    if (formData.experience < 0) {
      setError("Experience cannot be negative");
      return;
    }

    try {
      await updateDoctor(user._id, formData);

      await loadDoctor();

      setMessage("Profile updated successfully");
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to update profile");
    }
  }

  if (!doctor) {
    return <div className="p-6 text-slate-500">Loading profile...</div>;
  }

  return (
    <main className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
          Doctor Profile
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Dr. {doctor.name}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Professional Information
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-500">Name</label>

              <input
                value={doctor.name}
                disabled
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm text-slate-500">Specialization</label>

              <input
                value={doctor.specialization}
                disabled
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm text-slate-500">Department</label>

              <input
                value={doctor.department?.name || ""}
                disabled
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm text-slate-500">Email</label>

              <input
                value={doctor.email}
                disabled
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Editable Information
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-500">Phone</label>

              <input
                value={formData.phone}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    phone: e.target.value,
                  });

                  setError("");
                  setMessage("");
                }}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm text-slate-500">
                Experience (Years)
              </label>

              <input
                type="number"
                value={formData.experience}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    experience: Number(e.target.value),
                  });

                  setError("");
                  setMessage("");
                }}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm text-slate-500">Availability</label>

              <select
                value={formData.isAvailable}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    isAvailable: e.target.value === "true",
                  });

                  setError("");
                  setMessage("");
                }}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              >
                <option value={true}>Available</option>
                <option value={false}>Busy</option>
              </select>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          {message && <p className="mt-4 text-sm text-green-600">{message}</p>}

          <button
            type="submit"
            className="mt-8 rounded-2xl bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700"
          >
            Save Changes
          </button>
        </section>
      </form>
    </main>
  );
}
