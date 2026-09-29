import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Link2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Edit2,
  QrCode,
  MousePointerClick,
  Calendar,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { api, API_BASE, errorMessage } from "../api/client.js";
import ClicksChart from "../components/ClicksChart.jsx";
import BreakdownList from "../components/BreakdownList.jsx";
import Spinner from "../components/Spinner.jsx";

const RANGES = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

export default function LinkStats() {
  const { id } = useParams();
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .get(`/links/${id}/stats`, { params: { days } })
      .then(({ data: res }) => {
        setData(res);
        setNewUrl(res.link.originalUrl);
      })
      .catch((err) => toast.error(errorMessage(err)));
  }, [id, days]);

  const copyShortUrl = async () => {
    if (!data?.link?.shortUrl) return;
    try {
      await navigator.clipboard.writeText(data.link.shortUrl);
      setCopied(true);
      toast.success("Short URL copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy");
    }
  };

  const saveUrl = async () => {
    try {
      const { data: res } = await api.patch(`/links/${id}`, { originalUrl: newUrl });
      setData((prev) => ({ ...prev, link: res.link }));
      setEditing(false);
      toast.success("Destination updated! Short link stays identical.");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (!data) return <Spinner full />;
  const { link, stats } = data;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to all links</span>
        </Link>
      </div>

      {/* Main Link Header Card */}
      <div className="card relative overflow-hidden flex flex-col gap-6 md:flex-row md:items-center">
        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3 self-center md:self-auto">
          <img
            src={`${API_BASE}/links/${link._id}/qr?size=256`}
            alt="Dynamic QR Code"
            className="h-32 w-32 rounded-xl bg-white p-1.5 shadow-xs"
          />
          <span className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <QrCode className="h-3 w-3" /> Dynamic QR
          </span>
        </div>

        {/* Link Info */}
        <div className="min-w-0 flex-1 space-y-2">
          {link.title && (
            <h1 className="break-words text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {link.title}
            </h1>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 max-w-full items-center gap-1.5 text-base sm:text-lg font-extrabold text-brand-600 hover:text-brand-800 transition"
            >
              <Link2 className="h-4 w-4 flex-shrink-0" />
              <span className="break-all">{link.shortUrl.replace(/^https?:\/\//, "")}</span>
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
            </a>

            <button
              onClick={copyShortUrl}
              className="btn-ghost py-1 px-2.5 text-xs"
              title="Copy short link"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Destination URL & Inline Editor */}
          {editing ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                className="input text-xs"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
              />
              <div className="flex gap-2">
                <button className="btn-primary py-2 px-3 text-xs" onClick={saveUrl}>
                  Save changes
                </button>
                <button className="btn-ghost py-2 px-3 text-xs" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="min-w-0 truncate md:max-w-md">→ {link.originalUrl}</span>
              <button
                className="flex flex-shrink-0 items-center gap-1 font-semibold text-brand-600 hover:text-brand-800 transition cursor-pointer"
                onClick={() => setEditing(true)}
              >
                <Edit2 className="h-3 w-3" />
                <span>Edit</span>
              </button>
            </div>
          )}

          {/* Download QR buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <a
              href={`${API_BASE}/links/${link._id}/qr?format=png`}
              className="btn-ghost py-1.5 px-3 text-xs"
              download
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PNG QR</span>
            </a>
            <a
              href={`${API_BASE}/links/${link._id}/qr?format=svg`}
              className="btn-ghost py-1.5 px-3 text-xs"
              download
            >
              <Download className="h-3.5 w-3.5" />
              <span>Vector SVG</span>
            </a>
          </div>
        </div>

        {/* Total Clicks Metric Box */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-50 to-indigo-50/50 border border-brand-100 p-5 text-center md:min-w-[160px]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
            <MousePointerClick className="h-5 w-5" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
            {link.clicks.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            All-Time Clicks
          </p>
        </div>
      </div>

      {/* Chart Card */}
      <div className="card">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-600" />
              Clicks Activity
            </h2>
            <p className="text-xs text-slate-500">Track clicks generated over selected time periods</p>
          </div>

          {/* Time range selector */}
          <div className="flex w-full items-center gap-1 rounded-xl bg-slate-100 p-1 sm:w-auto">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setDays(r.value)}
                className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer sm:flex-none ${
                  days === r.value
                    ? "bg-white text-brand-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <ClicksChart data={stats.daily} />

        {stats.trackedClicks < link.clicks && days >= 30 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 flex items-start gap-2 sm:items-center">
            <Sparkles className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span>
              Detailed click telemetry is limited by your current plan's tracked clicks quota.{" "}
              <Link to="/billing" className="font-bold underline">Upgrade plan</Link> for deeper history.
            </span>
          </div>
        )}
      </div>

      {/* 4 Breakdown Cards */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <BreakdownList title="Top Traffic Sources" items={stats.referrers} />
        <BreakdownList title="Device Types" items={stats.devices} />
        <BreakdownList title="Web Browsers" items={stats.browsers} />
        <BreakdownList title="Geographic Locations" items={stats.countries} />
      </div>
    </div>
  );
}
