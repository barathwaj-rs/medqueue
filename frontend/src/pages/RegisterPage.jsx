import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, getDepartments } from "../services/api.js";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [departments, setDepartments] = useState([]);
  const [specialization, setSpecialization] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await getDepartments();
        setDepartments(response.data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchDepartments();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (!name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (name.trim().length < 3) {
      setError("Name must contain at least 3 characters");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Invalid email address");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (role === "doctor") {
      if (!specialization.trim()) {
        setError("Specialization is required");
        setLoading(false);
        return;
      }

      if (!department) {
        setError("Please select a department");
        setLoading(false);
        return;
      }

      if (!phone.trim()) {
        setError("Phone number is required");
        setLoading(false);
        return;
      }

      const phonePattern = /^\d{10}$/;

      if (!phonePattern.test(phone.trim())) {
        setError("Phone number must contain exactly 10 digits");
        setLoading(false);
        return;
      }

      if (experience < 0) {
        setError("Invalid experience");
        setLoading(false);
        return;
      }
    }
    if (role === "doctor") {
      if (!specialization.trim()) {
        setError("Specialization is required");
        setLoading(false);
        return;
      }

      if (!department) {
        setError("Please select a department");
        setLoading(false);
        return;
      }

      if (!phone.trim()) {
        setError("Phone number is required");
        setLoading(false);
        return;
      }

      if (experience < 0) {
        setError("Invalid experience");
        setLoading(false);
        return;
      }
    }
    try {
      await registerUser({
        name,
        email,
        password,
        role,
        specialization,
        department,
        phone,
        experience,
      });
      navigate("/login");
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.65)] backdrop-blur-xl">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            MedQueue
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Create your account
          </h1>
          <p className="text-sm text-slate-400">
            Choose your role and join the hospital queue management platform.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-300"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Jane Doe"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-300"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />

            <div>
              <label className="block text-sm font-medium text-slate-300">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm password"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-slate-300"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {role === "doctor" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Specialization
                </label>

                <input
                  type="text"
                  value={specialization}
                  onChange={(event) => setSpecialization(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3"
                  placeholder="Cardiology"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Department Name
                </label>

                <select
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                >
                  <option value="">Select Department</option>

                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Phone
                </label>

                <input
                  type="text"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Experience (years)
                </label>

                <input
                  type="number"
                  value={experience}
                  onChange={(event) => setExperience(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3"
                />
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-cyan-400 transition hover:text-cyan-200"
          >
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
