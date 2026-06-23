import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      if (user.role === "doctor") {
        navigate("/doctor");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/patient");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Invalid email address");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await loginUser({ email, password });

      const userData = {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      };

      const token = response.data.token;

      login(userData, token);
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Login failed";
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
            Smart Hospital Queue Management
          </h1>
          <p className="text-sm text-slate-400">
            Securely sign in to manage patients, doctors, queues, and real-time
            hospital flow.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
              autoComplete="email"
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
              autoComplete="current-password"
              placeholder="Enter your password"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{" "}
          <Link
            to="/register"
            className="font-semibold text-cyan-400 transition hover:text-cyan-200"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
