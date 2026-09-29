import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Link2, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { errorMessage } from "../api/client.js";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back! 👋");
      navigate("/dashboard");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-6 sm:py-12">
      {/* Brand Icon Header */}
      <div className="text-center mb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25">
          <Link2 className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <h1 className="mt-4 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
          Welcome back to Linkzy
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Log in to manage your active short links, analytics & bio page.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card space-y-4 border-slate-200/90 shadow-xl shadow-slate-200/40"
      >
        <div>
          <label className="label flex items-center gap-1.5" htmlFor="email">
            <Mail className="h-3 w-3 text-slate-400" /> Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              required
              className="input pl-9 text-xs"
              placeholder="you@yourbrand.in"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Mail className="pointer-events-none absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        <div>
          <label className="label flex items-center gap-1.5" htmlFor="password">
            <Lock className="h-3 w-3 text-slate-400" /> Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              className="input pl-9 pr-10 text-xs"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Lock className="pointer-events-none absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <button
          className="btn-primary w-full py-3 text-xs shadow-md shadow-brand-500/25"
          disabled={submitting}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Logging in...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5 font-bold">
              <span>Sign in to Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          )}
        </button>

        <div className="pt-2 text-center text-xs text-slate-500">
          Don&apos;t have an account yet?{" "}
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            Create free account
          </Link>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        <span>256-bit encrypted authentication</span>
      </div>
    </div>
  );
}
