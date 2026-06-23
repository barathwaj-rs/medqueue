import React, { useEffect, useState } from "react";
import { getPatientById, changePassword } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function PatientProfilePage() {
  const { user } = useAuth();

  const [patient, setPatient] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      loadPatient();
    }
  }, [user]);

  async function loadPatient() {
    try {
      const response = await getPatientById(user._id);

      setPatient(response.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!currentPassword) {
      setError("Current password is required");
      return;
    }

    if (!newPassword) {
      setError("New password is required");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must contain at least 6 characters");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await changePassword(user._id, {
        currentPassword,
        newPassword,
      });

      setMessage("Password changed successfully");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to change password");
    }
  }

  if (!patient) {
    return (
      <main>
        <div className="rounded-3xl bg-white p-8 shadow-sm text-center text-slate-500">
          Loading profile...
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      {/* Header */}
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
          Patient Profile
        </p>

        <h1 className="mt-2 text-5xl font-bold text-slate-900">
          {patient.name}
        </h1>

        <p className="mt-3 text-slate-500">
          Manage your account and security settings.
        </p>
      </header>

      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="mb-8 text-3xl font-bold text-slate-900">
          Account Information
        </h2>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-500">
              Name
            </label>

            <input
              value={patient.name}
              readOnly
              className="
              w-full
              rounded-3xl
              bg-slate-50
              p-5
              text-xl
              text-slate-900
              cursor-not-allowed
              "
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-slate-500">
              Email
            </label>

            <input
              value={patient.email}
              readOnly
              className="
              w-full
              rounded-3xl
              bg-slate-50
              p-5
              text-xl
              text-slate-900
              cursor-not-allowed
              "
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-slate-500">
              Role
            </label>

            <input
              value="Patient"
              readOnly
              className="
              w-full
              rounded-3xl
              bg-slate-50
              p-5
              text-xl
              text-slate-900
              cursor-not-allowed
              "
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="mb-8 text-3xl font-bold text-slate-900">
          Security Settings
        </h2>

        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-500">
              Current Password
            </label>

            <input
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setError("");
                setMessage("");
              }}
              className="
              w-full
              rounded-3xl
              border
              border-slate-200
              p-5
              text-lg
              "
              required
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-slate-500">
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError("");
                setMessage("");
              }}
              className="
              w-full
              rounded-3xl
              border
              border-slate-200
              p-5
              text-lg
              "
              required
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-slate-500">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
                setMessage("");
              }}
              className="
              w-full
              rounded-3xl
              border
              border-slate-200
              p-5
              text-lg
              "
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {message && <p className="text-sm text-green-600">{message}</p>}

          <button
            type="submit"
            className="
            rounded-2xl
            bg-sky-600
            px-8
            py-4
            font-semibold
            text-white
            transition
            duration-200
            hover:bg-sky-700
            hover:scale-105
            "
          >
            Change Password
          </button>
        </form>
      </section>
    </main>
  );
}
