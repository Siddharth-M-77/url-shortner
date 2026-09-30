import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  MessageCircle,
  Copy,
  Check,
  Store,
  PenLine,
  Share2,
  MousePointerClick,
  RefreshCw,
  Globe,
  Smartphone,
  ChevronDown,
  IndianRupee,
  X,
} from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "../components/BrandIcons.jsx";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSeo } from "../utils/useSeo.js";
import { FAQS, FALLBACK_PLANS, PENDING_URL_KEY } from "../content/site.js";

const STEPS = [
  {
    icon: PenLine,
    title: "Paste your long link",
    text: "Drop in any product, catalog, YouTube or payment link, however long it is.",
  },
  {
    icon: Share2,
    title: "Share the short link",
    text: "Copy it or download its QR code, then post it on WhatsApp, Instagram or print.",
  },
  {
    icon: BarChart3,
    title: "Watch the clicks come in",
    text: "See where every click comes from, which device it was on, and when.",
  },
];

const USE_CASES = [
  {
    icon: MessageCircle,
    color: "text-emerald-600 bg-emerald-50 ring-emerald-100",
    title: "WhatsApp & Instagram sellers",
    text: "Send buyers straight to a product or checkout with a clean, trusted link.",
  },
  {
    icon: Store,
    color: "text-sky-600 bg-sky-50 ring-sky-100",
    title: "Shops & counters",
    text: "Print a QR on your bill, parcel or standee to collect reviews and orders.",
  },
  {
    icon: InstagramIcon,
    color: "text-rose-600 bg-rose-50 ring-rose-100",
    title: "Creators & influencers",
    text: "One bio link for your YouTube, brand deals, courses and merch.",
  },
  {
    icon: TrendingUp,
    color: "text-violet-600 bg-violet-50 ring-violet-100",
    title: "Marketers & agencies",
    text: "Tag each campaign with its own link and see which one actually converts.",
  },
];

const formatLimit = (value, unit) => (value === null ? `Unlimited ${unit}` : `${value.toLocaleString("en-IN")} ${unit}`);

// Decorative 14-day sparkline used in the hero and analytics card
const SPARK = [18, 24, 21, 30, 28, 36, 33, 42, 39, 51, 48, 60, 57, 72];
function Sparkline({ className = "", stroke = "#4f46e5", fill = "url(#sparkFill)" }) {
  const max = Math.max(...SPARK);
  const pts = SPARK.map((v, i) => `${(i / (SPARK.length - 1)) * 100},${40 - (v / max) * 36}`).join(" ");
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,40 ${pts} 100,40`} fill={fill} />
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

function SectionHeading({ eyebrow, title, text, dark = false }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className={`text-xs font-bold uppercase tracking-[0.18em] ${dark ? "text-brand-300" : "text-brand-600"}`}>{eyebrow}</p>
      <h2 className={`mt-3 font-display text-[1.75rem] leading-tight font-extrabold tracking-tight sm:text-4xl ${dark ? "text-white" : "text-slate-900"}`}>
        {title}
      </h2>
      {text && <p className={`mt-3 text-sm sm:text-base ${dark ? "text-slate-400" : "text-slate-600"}`}>{text}</p>}
    </div>
  );
}

function FaqItem({ q, a }) {
  return (
    <details className="group rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-xs transition open:shadow-md open:ring-1 open:ring-brand-100 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-bold text-slate-900 sm:text-base">
        <h3>{q}</h3>
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-open:rotate-180 group-open:bg-brand-50 group-open:text-brand-600">
          <ChevronDown className="h-4 w-4" />
        </span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{a}</p>
    </details>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [longUrl, setLongUrl] = useState("");
  const [demoCopied, setDemoCopied] = useState(false);

  useSeo({
    description:
      "Linkzy is a free URL shortener made for India. Shorten long links, create QR codes, track clicks from WhatsApp & Instagram, and build a link-in-bio page. Pay in ₹ with UPI.",
    path: "/",
  });

  useEffect(() => {
    api
      .get("/plans")
      .then(({ data }) => data.plans?.length && setPlans(data.plans))
      .catch(() => {});
  }, []);

  const handleShorten = (e) => {
    e.preventDefault();
    const url = longUrl.trim();
    try {
      if (url) sessionStorage.setItem(PENDING_URL_KEY, url);
    } catch {
      // Storage can be blocked (private mode); the user just pastes again
    }
    navigate(user ? "/dashboard" : "/register");
  };

  const handleCopyDemo = () => {
    navigator.clipboard?.writeText("linkzy.in/diwali-sale").catch(() => {});
    setDemoCopied(true);
    setTimeout(() => setDemoCopied(false), 2000);
  };

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* ───────────── Hero ───────────── */}
      <section className="relative pt-4 sm:pt-10">
        {/* Dotted grid backdrop fading out at the edges */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-[560px] bg-[radial-gradient(#c7d2fe_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"
        />

        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-brand-200/80 bg-white/90 py-1 pr-3 pl-1 shadow-sm backdrop-blur">
            <span className="rounded-full bg-gradient-to-r from-brand-600 to-violet-600 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
              New
            </span>
            <span className="truncate text-xs font-semibold text-slate-700">
              UPI Autopay plans from ₹{plans.find((p) => p.key === "starter")?.price ?? 99}/month
            </span>
          </div>

          <h1 className="mt-6 font-display text-[2.35rem] leading-[1.08] font-extrabold tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.05] lg:text-7xl">
            The free{" "}
            <span className="relative whitespace-nowrap">
              <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                URL shortener
              </span>
              <svg aria-hidden="true" viewBox="0 0 300 12" className="absolute -bottom-2 left-0 h-2.5 w-full text-brand-300 sm:-bottom-3 sm:h-3" preserveAspectRatio="none">
                <path d="M2 9C60 3 140 1 298 7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
              </svg>
            </span>{" "}
            built for India
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Turn long, messy links into short ones people trust. Get a QR code, live click analytics and a link-in-bio
            page, all in one place.
          </p>

          {/* Shorten box */}
          <form
            onSubmit={handleShorten}
            className="mx-auto mt-8 flex max-w-xl flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_50px_-20px_rgba(79,70,229,0.35)] sm:flex-row sm:items-center"
          >
            <label htmlFor="hero-url" className="sr-only">
              Long URL to shorten
            </label>
            <div className="relative flex-1">
              <Link2 className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="hero-url"
                type="text"
                inputMode="url"
                autoComplete="off"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                placeholder="Paste a long link…"
                className="w-full rounded-xl bg-transparent py-3 pr-3 pl-10 text-sm text-slate-900 placeholder-slate-400 outline-none"
              />
            </div>
            <button type="submit" className="btn-primary px-6 py-3 text-sm">
              Shorten free
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
            {["No credit card", "20 free links every month", "Pay in ₹ with UPI"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Product preview */}
        <div className="relative mx-auto mt-14 max-w-4xl sm:mt-16">
          <div aria-hidden="true" className="absolute inset-x-10 -top-6 -z-10 h-40 rounded-full bg-gradient-to-r from-brand-400/30 via-violet-400/30 to-sky-300/30 blur-3xl" />

          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/70 p-2 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-3">
            <div className="overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white">
              {/* Window bar */}
              <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200/80">
                  <ShieldCheck className="h-3 w-3 flex-shrink-0 text-emerald-500" />
                  <span className="truncate">linkzy.in/dashboard</span>
                </div>
              </div>

              <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-5">
                {/* Link + chart */}
                <div className="min-w-0 space-y-4 md:col-span-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-[11px] text-slate-500">
                    <p className="truncate text-slate-500">https://myshop.in/collections/festive/products/anarkali-suit?utm_source=insta</p>
                  </div>

                  <div className="flex items-center justify-between gap-2 rounded-xl border border-brand-200 bg-gradient-to-r from-brand-50 to-violet-50 px-3 py-3 sm:px-4">
                    <div className="flex min-w-0 items-center gap-2 font-semibold text-brand-700">
                      <Link2 className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-sm sm:text-base">linkzy.in/diwali-sale</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyDemo}
                      className="flex flex-shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-700 shadow-xs ring-1 ring-brand-200 transition hover:bg-brand-50"
                    >
                      {demoCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {demoCopied ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Clicks · 14 days</p>
                        <p className="mt-1 font-display text-2xl font-extrabold text-slate-900">4,892</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">+34%</span>
                    </div>
                    <Sparkline className="mt-3 h-20 w-full" />
                  </div>
                </div>

                {/* Sources + QR */}
                <div className="grid min-w-0 grid-cols-2 gap-4 md:col-span-2 md:grid-cols-1">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Top sources</p>
                    <ul className="mt-3 space-y-2.5">
                      {[
                        { label: "WhatsApp", pct: 68, icon: WhatsAppIcon, color: "bg-emerald-500" },
                        { label: "Instagram", pct: 22, icon: InstagramIcon, color: "bg-rose-500" },
                        { label: "Direct", pct: 10, icon: Globe, color: "bg-slate-400" },
                      ].map((s) => (
                        <li key={s.label}>
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                            <span className="flex items-center gap-1.5">
                              <s.icon className="h-3 w-3" />
                              {s.label}
                            </span>
                            {s.pct}%
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                            <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-center">
                    <div className="rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
                      <QrCode className="h-16 w-16 text-slate-900 sm:h-20 sm:w-20" strokeWidth={1.5} />
                    </div>
                    <p className="mt-2 text-[11px] font-bold text-slate-700">PNG & SVG QR</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating chips (hidden on small phones to keep things clean) */}
          <div className="absolute bottom-28 -left-10 hidden items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-2 shadow-xl backdrop-blur lg:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <MousePointerClick className="h-4 w-4" />
            </span>
            <div className="text-left">
              <p className="text-[10px] font-semibold text-slate-400">New click</p>
              <p className="text-xs font-bold text-slate-800">Mumbai · WhatsApp</p>
            </div>
          </div>
          <div className="absolute -right-6 bottom-16 hidden items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-2 shadow-xl backdrop-blur lg:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white">
              <IndianRupee className="h-4 w-4" />
            </span>
            <div className="text-left">
              <p className="text-[10px] font-semibold text-slate-400">Paid via</p>
              <p className="text-xs font-bold text-slate-800">UPI Autopay</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Quick facts strip ───────────── */}
      <section aria-label="Highlights" className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-200/80 sm:grid-cols-4">
        {[
          { value: "₹0", label: "to get started" },
          { value: "20", label: "free links a month" },
          { value: "PNG + SVG", label: "print-ready QR codes" },
          { value: "UPI", label: "Autopay billing in ₹" },
        ].map((f) => (
          <div key={f.label} className="bg-white px-4 py-5 text-center sm:py-6">
            <p className="font-display text-xl font-extrabold text-slate-900 sm:text-2xl">{f.value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{f.label}</p>
          </div>
        ))}
      </section>

      {/* ───────────── How it works ───────────── */}
      <section aria-labelledby="how-heading">
        <SectionHeading eyebrow="How it works" title={<span id="how-heading">Shorten a link in 3 steps</span>} />
        <ol className="relative mt-10 grid gap-4 sm:mt-12 md:grid-cols-3 md:gap-6">
          <div aria-hidden="true" className="absolute top-8 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent md:block" />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs md:flex-col md:items-center md:p-6 md:text-center">
              <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-500/25">
                <s.icon className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-extrabold text-brand-700 shadow ring-1 ring-brand-100">
                  {i + 1}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────────── Features bento (dark) ───────────── */}
      <section
        id="features"
        aria-labelledby="features-heading"
        className="relative scroll-mt-24 overflow-hidden rounded-[2rem] bg-slate-950 px-4 py-14 sm:px-10 sm:py-20"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-brand-600/30 blur-3xl" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_75%)]"
        />

        <div className="relative">
          <SectionHeading
            dark
            eyebrow="Features"
            title={<span id="features-heading">More than a link shortener</span>}
            text="Everything you need to share links, measure them and turn clicks into sales."
          />

          <div className="mt-10 grid gap-4 sm:mt-14 md:grid-cols-6">
            {/* Analytics — wide */}
            <article className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:border-white/20 md:col-span-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/20">
                  <BarChart3 className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-bold text-white">Click analytics</h3>
              </div>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
                See every click as it happens: which app it came from, the device, browser and country, over 7, 30 or 90 days.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:col-span-2">
                  <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Clicks</p>
                  <Sparkline className="mt-2 h-24 w-full" stroke="#a5b4fc" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <Smartphone className="h-4 w-4 text-sky-300" />
                    <p className="mt-2 font-display text-xl font-bold text-white">82%</p>
                    <p className="text-[11px] text-slate-400">on mobile</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <WhatsAppIcon className="h-4 w-4 text-emerald-300" />
                    <p className="mt-2 font-display text-xl font-bold text-white">68%</p>
                    <p className="text-[11px] text-slate-400">from WhatsApp</p>
                  </div>
                </div>
              </div>
            </article>

            {/* QR */}
            <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:border-white/20 md:col-span-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20">
                <QrCode className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-white">QR code for every link</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Download in PNG or sharp SVG for bills, parcels, menus and standees.
              </p>
              <div className="mt-6 flex justify-center">
                <div className="rounded-2xl bg-white p-3 shadow-2xl shadow-emerald-500/10">
                  <QrCode className="h-24 w-24 text-slate-900" strokeWidth={1.4} />
                </div>
              </div>
            </article>

            {/* Bio page */}
            <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:border-white/20 md:col-span-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/20">
                <Sparkles className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-white">Link-in-bio page</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                A mobile storefront with a WhatsApp chat button, your links and themes.
              </p>
              <div className="mx-auto mt-6 w-40 rounded-[1.4rem] border-4 border-slate-800 bg-gradient-to-b from-brand-500 to-violet-600 p-3">
                <div className="mx-auto h-9 w-9 rounded-full bg-white/30 ring-2 ring-white/40" />
                <div className="mx-auto mt-2 h-1.5 w-16 rounded-full bg-white/60" />
                <div className="mt-3 space-y-1.5">
                  <div className="flex h-5 items-center justify-center gap-1 rounded-md bg-[#0b7a3b] text-[8px] font-bold text-white">
                    <WhatsAppIcon className="h-2.5 w-2.5" /> Chat on WhatsApp
                  </div>
                  <div className="h-5 rounded-md bg-white/25" />
                  <div className="h-5 rounded-md bg-white/25" />
                </div>
              </div>
            </article>

            {/* Custom alias */}
            <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:border-white/20 md:col-span-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/20">
                <Link2 className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-white">Custom short links</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">Pick your own ending so people know what they're clicking.</p>
              <div className="mt-6 space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5 text-slate-400 line-through decoration-rose-400/70">
                  <X className="h-3.5 w-3.5 flex-shrink-0 text-rose-400" />
                  <span className="truncate">linkzy.in/x7Kq2</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2.5 text-emerald-200">
                  <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-300" />
                  <span className="truncate">linkzy.in/diwali-sale</span>
                </div>
              </div>
            </article>

            {/* Edit anytime */}
            <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:border-white/20 md:col-span-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20">
                <RefreshCw className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-white">Change it after printing</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Update where a link goes, pause it or set an expiry. Your printed QR keeps working.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs">
                <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1.5 font-semibold text-emerald-300">Active</span>
                <span className="rounded-lg bg-slate-800 px-2.5 py-1.5 font-semibold text-slate-300">Paused</span>
                <span className="rounded-lg bg-slate-800 px-2.5 py-1.5 font-semibold text-slate-300">Expires 30d</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ───────────── Use cases ───────────── */}
      <section aria-labelledby="usecases-heading">
        <SectionHeading
          eyebrow="Who it's for"
          title={<span id="usecases-heading">Made for how India sells online</span>}
          text="From Instagram reels to the shop counter, one short link works everywhere."
        />
        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((uc) => (
            <article key={uc.title} className="card card-hover">
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${uc.color}`}>
                <uc.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">{uc.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{uc.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ───────────── Pricing ───────────── */}
      <section id="pricing" aria-labelledby="pricing-heading" className="scroll-mt-24">
        <SectionHeading
          eyebrow="Pricing"
          title={<span id="pricing-heading">Simple pricing in rupees</span>}
          text="Start free. Upgrade when you grow. Pay with UPI, cards or netbanking and cancel anytime."
        />

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3 md:gap-5">
          {plans.map((p) => {
            const featured = p.key === "starter";
            const features = [
              { on: true, text: formatLimit(p.linksPerMonth, "links / month") },
              { on: true, text: formatLimit(p.trackedClicksPerMonth, "tracked clicks / month") },
              { on: true, text: "QR codes & link-in-bio page" },
              { on: p.customAlias, text: "Custom short links" },
              { on: p.removeBranding, text: "Remove Linkzy branding" },
            ];
            return (
              <div
                key={p.key}
                className={`relative flex flex-col rounded-3xl p-6 sm:p-7 ${
                  featured
                    ? "bg-slate-950 text-white shadow-2xl shadow-brand-600/25 ring-1 ring-slate-900 md:-my-4 md:py-10"
                    : "border border-slate-200 bg-white shadow-xs"
                }`}
              >
                {featured && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500 to-violet-500 px-3.5 py-1 text-xs font-bold whitespace-nowrap text-white shadow-lg">
                    Most popular
                  </span>
                )}
                <h3 className={`text-lg font-bold ${featured ? "text-white" : "text-slate-900"}`}>{p.name}</h3>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">₹{p.price}</span>
                  <span className={`text-sm ${featured ? "text-slate-400" : "text-slate-500"}`}>/month</span>
                </p>
                <p className={`mt-2 text-sm ${featured ? "text-slate-400" : "text-slate-500"}`}>
                  {p.price === 0
                    ? "For trying it out and personal links."
                    : featured
                      ? "For growing WhatsApp & Instagram sellers."
                      : "For brands and power creators."}
                </p>

                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {features.map((f) => (
                    <li
                      key={f.text}
                      className={`flex items-start gap-2.5 ${f.on ? "" : featured ? "text-slate-400" : "text-slate-500"}`}
                    >
                      {f.on ? (
                        <CheckCircle2 className={`mt-0.5 h-4 w-4 flex-shrink-0 ${featured ? "text-brand-300" : "text-emerald-500"}`} />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      )}
                      <span className={f.on ? "" : "line-through"}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={user ? (p.price === 0 ? "/dashboard" : "/billing") : "/register"}
                  className={`mt-8 w-full justify-center py-3 ${
                    featured ? "btn bg-white text-slate-900 hover:bg-brand-50" : "btn-ghost font-bold"
                  }`}
                >
                  {p.price === 0 ? "Start free" : `Get ${p.name}`}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 flex-shrink-0 text-emerald-500" />
          Secure payments by Razorpay · No hidden fees
        </p>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section aria-labelledby="faq-heading" className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="FAQ" title={<span id="faq-heading">Questions, answered</span>} />
        <div className="mt-10 space-y-3">
          {FAQS.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* ───────────── Final CTA ───────────── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-indigo-600 to-violet-700 px-5 py-14 text-center text-white shadow-2xl shadow-brand-600/25 sm:px-12 sm:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-display text-[1.75rem] leading-tight font-extrabold tracking-tight sm:text-5xl">
            Your next link deserves better than 200 characters.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-indigo-100 sm:text-base">
            Create your free account in under a minute. No card, no setup.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="btn w-full bg-white px-7 py-3.5 text-base text-brand-700 shadow-lg hover:bg-brand-50 sm:w-auto"
            >
              <Zap className="h-5 w-5 fill-brand-600 text-brand-600" />
              {user ? "Open dashboard" : "Create free account"}
            </Link>
            <a href="#pricing" className="btn w-full border border-white/30 px-7 py-3.5 text-base text-white hover:bg-white/10 sm:w-auto">
              See pricing
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
