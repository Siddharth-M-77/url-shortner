import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Link2,
  BarChart3,
  QrCode,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck,
  TrendingUp,
  Smartphone,
  MessageCircle,
  Copy,
  ExternalLink,
  Store,
} from "lucide-react";
import { InstagramIcon } from "../components/BrandIcons.jsx";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const FEATURES = [
  {
    icon: Link2,
    gradient: "from-blue-500 to-indigo-600",
    title: "Smart Short Links",
    text: "Convert messy 100-character product URLs into branded, memorable links optimized for Instagram & WhatsApp.",
    badge: "Fast Edge Redirects",
  },
  {
    icon: BarChart3,
    gradient: "from-violet-500 to-purple-600",
    title: "Deep Click Analytics",
    text: "Track every single visitor in real-time. Uncover top referral channels, cities, devices, and peak buying hours.",
    badge: "Real-time Tracking",
  },
  {
    icon: QrCode,
    gradient: "from-emerald-500 to-teal-600",
    title: "Dynamic QR Codes",
    text: "Instant vector PNG & SVG QR codes for physical counters, parcel packaging, brochures, and standees.",
    badge: "Print Ready",
  },
  {
    icon: Sparkles,
    gradient: "from-pink-500 to-rose-600",
    title: "Link-in-Bio Storefront",
    text: "One stunning mobile-first landing page with direct WhatsApp checkout, Instagram links, and catalog items.",
    badge: "Zero Code Needed",
  },
];

const USE_CASES = [
  {
    title: "WhatsApp & Instagram D2C",
    desc: "Send buyers straight to WhatsApp catalog or product checkout with custom branded slugs.",
    icon: MessageCircle,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    title: "Retail & Counter QR",
    desc: "Print scannable QR codes for your billing desk to collect reviews, leads, and catalog orders.",
    icon: Store,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    title: "Content Creators",
    desc: "Consolidate YouTube, brand deals, podcasts, and merchandise under one verified link in your bio.",
    icon: InstagramIcon,
    color: "text-pink-600 bg-pink-50 border-pink-200",
  },
  {
    title: "Agencies & Growth Marketers",
    desc: "Track ROI on ad campaigns and affiliate influencers across WhatsApp, Meta, and Google ads.",
    icon: TrendingUp,
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
];

const formatLimit = (value, unit) => (value === null ? `Unlimited ${unit}` : `${value.toLocaleString("en-IN")} ${unit}`);

export default function Landing() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [demoCopied, setDemoCopied] = useState(false);

  useEffect(() => {
    api.get("/plans").then(({ data }) => setPlans(data.plans)).catch(() => {});
  }, []);

  const handleCopyDemo = () => {
    navigator.clipboard?.writeText("https://linkzy.in/diwali-kurti-sale").catch(() => {});
    setDemoCopied(true);
    setTimeout(() => setDemoCopied(false), 2000);
  };

  return (
    <div className="space-y-16 py-2 sm:space-y-24 sm:py-8">
      {/* Hero Section */}
      <section className="relative text-center">
        {/* Glowing Announcement Pill */}
        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-brand-200/80 bg-white/90 px-3 py-1.5 sm:px-4 shadow-sm backdrop-blur-md transition-transform hover:scale-105">
          <span className="flex h-2 w-2 flex-shrink-0 rounded-full bg-brand-600 animate-pulse" />
          <span className="text-[11px] font-semibold text-brand-900 sm:text-xs">
            ⚡ Made specifically for Indian Creators & D2C Sellers
          </span>
          <span className="hidden rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 sm:inline">
            v2.0
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="mx-auto mt-6 max-w-4xl text-[2rem] leading-tight font-extrabold sm:text-6xl sm:leading-[1.15] tracking-tight text-slate-900">
          Turn Every Single Click Into{" "}
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Paying Customers
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 sm:mt-6 sm:text-lg leading-relaxed">
          Supercharge your brand with ultra-fast short links, print-ready QR codes, and a gorgeous bio page. Built with native rupee pricing and zero complex setups.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            to={user ? "/dashboard" : "/register"}
            className="btn-primary group w-full px-7 py-3.5 text-base sm:w-auto"
          >
            <Zap className="h-5 w-5 fill-white" />
            <span>{user ? "Go to Dashboard" : "Get Started Free"}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#pricing"
            className="btn-ghost w-full px-7 py-3.5 text-base sm:w-auto text-slate-700 hover:text-slate-900"
          >
            Explore Pricing (₹ INR)
          </a>
        </div>

        {/* Social Proof / Trust metrics */}
        <div className="mt-8 grid grid-cols-2 gap-3 text-left sm:mt-10 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-6 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
            <span>Free forever tier</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
            <span>Instant UPI activation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
            <span>Sub-millisecond redirects</span>
          </div>
        </div>

        {/* Interactive Visual Product Mockup */}
        <div className="relative mx-auto mt-10 sm:mt-14 max-w-4xl rounded-2xl border border-slate-200/80 bg-white/70 p-4 sm:p-7 shadow-[0_20px_50px_-15px_rgba(79,70,229,0.12)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-2 hidden text-xs font-semibold text-slate-400 sm:inline">linkzy.in / live demonstration</span>
            </div>
            <span className="badge badge-emerald">Live Active</span>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-12 items-center text-left">
            <div className="md:col-span-8 space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Original Long URL</p>
                <div className="mt-1 flex items-center rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500 font-mono border border-slate-200 truncate">
                  https://myshop.in/collections/festive-wear/products/handcrafted-anarkali-suit?ref=insta_bio_campaign
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> High Converting Short Link
                </p>
                <div className="mt-1 flex items-center justify-between gap-2 rounded-xl bg-brand-50/80 border border-brand-200 px-3 py-3 sm:px-4">
                  <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-brand-700 sm:text-base">
                    <Link2 className="h-4 w-4 flex-shrink-0 text-brand-600" />
                    <span className="truncate">linkzy.in/diwali-kurti-sale</span>
                  </div>
                  <button
                    onClick={handleCopyDemo}
                    className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-brand-700 shadow-xs border border-brand-200/80 hover:bg-brand-50 transition cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {demoCopied ? "Copied! ✨" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Mini Stats Ribbon */}
              <div className="grid grid-cols-3 gap-2 pt-2 sm:gap-3">
                <div className="min-w-0 rounded-xl border border-slate-100 bg-white p-2.5 shadow-xs sm:p-3">
                  <p className="text-[11px] text-slate-400">Clicks</p>
                  <p className="text-base font-bold text-slate-900 sm:text-lg">4,892</p>
                </div>
                <div className="min-w-0 rounded-xl border border-slate-100 bg-white p-2.5 shadow-xs sm:p-3">
                  <p className="text-[11px] text-slate-400">Top Channel</p>
                  <p className="text-xs font-bold leading-snug text-emerald-600 sm:text-sm">WhatsApp (68%)</p>
                </div>
                <div className="min-w-0 rounded-xl border border-slate-100 bg-white p-2.5 shadow-xs sm:p-3">
                  <p className="text-[11px] text-slate-400">Conversion</p>
                  <p className="text-base font-bold text-brand-600 sm:text-lg">+34.2%</p>
                </div>
              </div>
            </div>

            {/* QR Mockup on Right */}
            <div className="md:col-span-4 flex flex-col items-center justify-center rounded-xl bg-slate-50 border border-slate-200/80 p-5 text-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-white p-2 shadow-sm border border-slate-200">
                <QrCode className="h-28 w-28 text-slate-900" />
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-800">Scan to Open</p>
              <p className="text-[11px] text-slate-500">Instant redirection in 30ms</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="scroll-mt-24 space-y-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Sparkles className="h-3.5 w-3.5" /> Core Capabilities
          </div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need to grow your digital footprint
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600 text-sm sm:text-base">
            Engineered to remove friction between your social audience and your products.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="card card-hover group relative flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${f.gradient} shadow-md text-white transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-5">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {f.badge}
                    </span>
                    <h3 className="mt-2 text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {f.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-5 sm:p-12 shadow-sm">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Built for how modern Indian commerce actually works
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            From Instagram reels to street counters, Linkzy bridges physical and digital customer discovery.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((uc) => {
            const Icon = uc.icon;
            return (
              <div key={uc.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${uc.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="mt-4 font-bold text-slate-900 text-sm">{uc.title}</h4>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{uc.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            ₹ 100% Transparent INR Pricing
          </div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Simple, honest pricing for every stage
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            No unexpected currency fees or overseas card surcharges. Pay securely via UPI, Cards, or Netbanking.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6 items-stretch">
          {plans.map((p) => {
            const isStarter = p.key === "starter";
            const isPro = p.key === "pro";
            return (
              <div
                key={p.key}
                className={`relative flex flex-col justify-between rounded-3xl border bg-white p-6 sm:p-8 transition-all ${
                  isStarter
                    ? "border-brand-500 shadow-xl shadow-brand-500/10 ring-2 ring-brand-500/20 md:-translate-y-2"
                    : "border-slate-200 shadow-sm hover:shadow-md"
                }`}
              >
                {isStarter && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-1 text-xs font-bold whitespace-nowrap text-white shadow-md">
                    🔥 Most Popular for Sellers
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                    {isPro && (
                      <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
                        Power Users
                      </span>
                    )}
                  </div>

                  <p className="mt-4 flex items-baseline gap-1 text-slate-900">
                    <span className="text-4xl font-extrabold tracking-tight">₹{p.price}</span>
                    <span className="text-sm font-medium text-slate-500">/ month</span>
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {p.price === 0
                      ? "Great for starting out & personal bios."
                      : isStarter
                        ? "Ideal for growing WhatsApp & Instagram sellers."
                        : "Full suite for power creators & thriving brands."}
                  </p>

                  <div className="my-6 h-px bg-slate-100" />

                  <ul className="space-y-3 text-xs text-slate-700">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span>{formatLimit(p.linksPerMonth, "links / month")}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span>{formatLimit(p.trackedClicksPerMonth, "tracked clicks / month")}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span>Vector QR codes & customizable bio page</span>
                    </li>
                    <li className={`flex items-center gap-2.5 ${p.customAlias ? "text-slate-800" : "text-slate-400"}`}>
                      {p.customAlias ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <span className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400 flex-shrink-0">✕</span>
                      )}
                      <span>Custom branded alias (e.g. /diwali-sale)</span>
                    </li>
                    <li className={`flex items-center gap-2.5 ${p.removeBranding ? "text-slate-800" : "text-slate-400"}`}>
                      {p.removeBranding ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <span className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400 flex-shrink-0">✕</span>
                      )}
                      <span>Remove Linkzy branding on bio page</span>
                    </li>
                  </ul>
                </div>

                <Link
                  to={user ? (p.price === 0 ? "/dashboard" : "/billing") : "/register"}
                  className={`mt-8 w-full justify-center ${
                    isStarter ? "btn-primary py-3" : "btn-ghost py-3 font-bold"
                  }`}
                >
                  {p.price === 0 ? "Start Free Today" : `Choose ${p.name}`}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Inspiring Bottom CTA Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-700 px-5 py-12 sm:px-12 sm:py-16 text-white shadow-xl shadow-brand-500/20 text-center">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />

        <div className="relative mx-auto max-w-2xl space-y-4">
          <span className="inline-block rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
            🚀 Ready in 30 seconds
          </span>
          <h2 className="text-2xl font-extrabold sm:text-4xl tracking-tight">
            Stop losing sales to long, messy links.
          </h2>
          <p className="text-sm text-indigo-100 sm:text-base">
            Join thousands of Indian shop owners and influencers who build high-converting traffic with Linkzy.
          </p>
          <div className="pt-4">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold sm:w-auto sm:px-7 sm:text-base text-brand-700 shadow-md transition hover:bg-slate-100 hover:scale-105 active:scale-95"
            >
              <Zap className="h-5 w-5 fill-brand-700 text-brand-700" />
              {user ? "Open Your Dashboard" : "Create Your Free Account"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
