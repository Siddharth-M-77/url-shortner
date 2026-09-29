import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Link2,
  Sparkles,
  CreditCard,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  User as UserIcon,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { BUSINESS } from "../config/business.js";

const navClass = ({ isActive }) =>
  `relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-150 ${
    isActive
      ? "bg-brand-50 text-brand-700 shadow-xs"
      : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
  }`;

export default function Layout() {
  const { user, plan, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-50/60">
      {/* Subtle decorative background gradient glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-brand-200/40 via-indigo-100/30 to-purple-200/30 blur-3xl" />
        <div className="absolute top-[40%] -right-40 h-[450px] w-[500px] rounded-full bg-gradient-to-bl from-cyan-100/40 via-sky-100/30 to-blue-200/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[450px] w-[500px] rounded-full bg-gradient-to-tr from-indigo-100/40 via-purple-100/30 to-pink-100/20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-500 shadow-md shadow-brand-500/25 transition-transform duration-200 group-hover:scale-105">
              <Link2 className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                Linkzy<span className="text-brand-600">.</span>
              </span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:block -mt-1">
                India's Bio & Link OS
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1.5 md:flex">
            {user ? (
              <>
                <NavLink to="/dashboard" className={navClass}>
                  <Link2 className="h-4 w-4" />
                  Links
                </NavLink>
                <NavLink to="/bio" className={navClass}>
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  Bio Page
                </NavLink>
                <NavLink to="/billing" className={navClass}>
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  Billing
                </NavLink>
                {user.role === "admin" && (
                  <NavLink to="/admin" className={navClass}>
                    <ShieldAlert className="h-4 w-4 text-rose-600" />
                    Admin
                  </NavLink>
                )}

                <div className="ml-3 h-5 w-px bg-slate-200" />

                {/* User chip */}
                <div className="ml-2 flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white/90 px-3 py-1.5 shadow-xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-600 text-xs font-bold text-white uppercase shadow-xs">
                    {(user.name || user.email || "U")[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[100px]">
                      {user.name?.split(" ")[0] || "User"}
                    </span>
                    <span className="text-[10px] font-medium text-brand-600 capitalize leading-none">
                      {plan?.name || "Free"} plan
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="ml-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <a href="#features" className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  Features
                </a>
                <a href="#pricing" className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  Pricing
                </a>
                <NavLink to="/login" className={navClass}>
                  Login
                </NavLink>
                <Link to="/register" className="btn-primary ml-2 py-2">
                  <Zap className="h-4 w-4 fill-white" />
                  Start free
                </Link>
              </>
            )}
          </nav>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden shadow-xs cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white/95 px-4 pt-3 pb-5 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  <div className="mb-2 flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 font-bold text-white uppercase">
                      {(user.name || user.email || "U")[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-brand-600 font-medium capitalize">{plan?.name || "Free"} plan</p>
                    </div>
                  </div>
                  <NavLink
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={navClass}
                  >
                    <Link2 className="h-4 w-4" />
                    Links & Analytics
                  </NavLink>
                  <NavLink
                    to="/bio"
                    onClick={() => setMobileMenuOpen(false)}
                    className={navClass}
                  >
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Link-in-Bio Page
                  </NavLink>
                  <NavLink
                    to="/billing"
                    onClick={() => setMobileMenuOpen(false)}
                    className={navClass}
                  >
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    Billing & Subscription
                  </NavLink>
                  {user.role === "admin" && (
                    <NavLink
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={navClass}
                    >
                      <ShieldAlert className="h-4 w-4 text-rose-600" />
                      Admin Control
                    </NavLink>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="mt-2 flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className={navClass}
                  >
                    Log in to your account
                  </NavLink>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary mt-1 justify-center py-2.5"
                  >
                    <Zap className="h-4 w-4 fill-white" />
                    Get started free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content body */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      {/* Modern High-End Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/70 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            {/* Logo and Tagline */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs">
                  <Link2 className="h-4 w-4" />
                </div>
                <span className="font-display font-bold text-slate-900">Linkzy</span>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  🇮🇳 Made for India
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500 max-w-sm">
                High-converting short URLs, dynamic QR codes, and smart bio pages built for Indian brands, creators and D2C sellers.
              </p>
            </div>

            {/* Quick Policy links */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600">
              <Link to="/terms" className="hover:text-brand-600 transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/privacy" className="hover:text-brand-600 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/refund" className="hover:text-brand-600 transition-colors">
                Refund Policy
              </Link>
              <Link to="/contact" className="hover:text-brand-600 transition-colors">
                Contact Us
              </Link>
              <Link to="/report" className="text-rose-600 hover:text-rose-700 transition-colors">
                Report Abuse
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row">
            <p>© {new Date().getFullYear()} {BUSINESS.legalName}. All rights reserved.</p>
            <div className="mt-2 flex items-center gap-4 sm:mt-0">
              <span className="flex items-center gap-1.5 text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Bank-Grade 256-bit SSL
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                Razorpay Verified
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
