import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Link2,
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { errorMessage } from "../api/client.js";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success("Account created successfully! Welcome to Linkzy.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-6 sm:py-12">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25">
          <Link2 className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
          Create your free Linkzy account
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Start generating branded short links and high-converting bio pages today.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card space-y-4 border-slate-200/90 shadow-xl shadow-slate-200/40"
      >
        <div>
          <label className="label flex items-center gap-1.5" htmlFor="name">
            <UserIcon className="h-3 w-3 text-slate-400" /> Full Name or Business Name
          </label>
          <div className="relative">
            <input
              id="name"
              required
              className="input pl-9 text-xs"
              placeholder="e.g. Ananya Sharma or Sharma Sarees"
              value={form.name}
              onChange={update("name")}
            />
            <UserIcon className="pointer-events-none absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

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
              onChange={update("email")}
            />
            <Mail className="pointer-events-none absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        <div>
          <label className="label flex items-center gap-1.5" htmlFor="password">
            <Lock className="h-3 w-3 text-slate-400" /> Choose Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              className="input pl-9 pr-10 text-xs"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={update("password")}
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

        {/* Benefits bullets */}
        <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 text-[11px] text-slate-600 border border-slate-100">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Instant setup · Zero credit card needed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Free QR codes & analytics included</span>
          </div>
        </div>

        <button
          className="btn-primary w-full py-3 text-xs shadow-md shadow-brand-500/25"
          disabled={submitting}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating your account...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5 font-bold">
              <span>Create Free Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          )}
        </button>

        <div className="pt-2 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Log in instead
          </Link>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        <span>Your data is protected under India DPDP Act guidelines</span>
      </div>
    </div>
  );
}
