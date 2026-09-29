import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Link2,
  MousePointerClick,
  Sparkles,
  Calendar,
  Search,
  ArrowUpRight,
  TrendingUp,
  Zap,
  Filter,
  RefreshCw,
  Plus,
  ExternalLink,
} from "lucide-react";
import { api, errorMessage } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import CreateLinkForm from "../components/CreateLinkForm.jsx";
import LinkRow from "../components/LinkRow.jsx";
import ClicksChart from "../components/ClicksChart.jsx";
import Spinner from "../components/Spinner.jsx";

function StatCard({ label, value, hint, icon: Icon, color, progress }) {
  return (
    <div className="card card-hover relative overflow-hidden flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        {progress !== undefined && (
          <div className="mb-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
        <div className="text-xs text-slate-500">{hint}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, plan, usage } = useAuth();
  const [links, setLinks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [overview, setOverview] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadLinks = useCallback(async (page = 1, query = "") => {
    setLoading(true);
    try {
      const { data } = await api.get("/links", { params: { page, limit: 10, search: query } });
      setLinks(data.links);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOverview = useCallback(() => {
    api.get("/links/overview").then(({ data }) => setOverview(data)).catch(() => {});
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  // Debounce search so we don't call the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => loadLinks(1, search), 300);
    return () => clearTimeout(t);
  }, [search, loadLinks]);

  const handleCreated = (link) => {
    setLinks((prev) => [link, ...prev].slice(0, 10));
    loadOverview();
  };
  const handleChange = (updated) => setLinks((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
  const handleDelete = (id) => {
    setLinks((prev) => prev.filter((l) => l._id !== id));
    loadOverview();
  };

  const linkLimit = plan?.linksPerMonth;
  const currentMonthLinks = usage?.linksThisMonth ?? 0;
  const linkProgress = linkLimit ? (currentMonthLinks / linkLimit) * 100 : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-white/70 p-4 sm:p-6 backdrop-blur-md shadow-xs">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-extrabold text-lg shadow-md shadow-brand-500/20 uppercase">
            {(user?.name || user?.email || "U")[0]}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Hi, {user?.name?.split(" ")[0]} 👋
              </h1>
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700 border border-brand-200/80 capitalize">
                {plan?.name} Plan
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Manage your high-performing short links, QR codes and track conversion metrics.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
          {plan?.key === "free" && (
            <Link
              to="/billing"
              className="btn-primary py-2 text-xs shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Upgrade to Starter
            </Link>
          )}
          <Link
            to="/bio"
            className="btn-ghost py-2 text-xs"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
            View Bio Page
          </Link>
        </div>
      </div>

      {/* Shorten Form */}
      <CreateLinkForm onCreated={handleCreated} />

      {/* 3 Main Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        <StatCard
          label="Total Links"
          value={overview?.totalLinks ?? "–"}
          icon={Link2}
          color="bg-blue-50 text-blue-600 border border-blue-200/60"
          hint={<span>Created under your account</span>}
        />
        <StatCard
          label="Total Clicks"
          value={overview?.totalClicks?.toLocaleString("en-IN") ?? "–"}
          icon={MousePointerClick}
          color="bg-emerald-50 text-emerald-600 border border-emerald-200/60"
          hint={<span>Tracked across all channels</span>}
        />
        <StatCard
          label="Links This Month"
          value={`${currentMonthLinks}${linkLimit ? ` / ${linkLimit}` : ""}`}
          icon={TrendingUp}
          color="bg-purple-50 text-purple-600 border border-purple-200/60"
          progress={linkLimit ? linkProgress : undefined}
          hint={
            linkLimit ? (
              <span className="flex flex-wrap items-center justify-between gap-1">
                <span>{linkLimit - currentMonthLinks > 0 ? `${linkLimit - currentMonthLinks} links remaining` : "Quota reached"}</span>
                <Link to="/billing" className="font-semibold text-brand-600 hover:underline">Upgrade →</Link>
              </span>
            ) : (
              <span>Unlimited links on your plan ✨</span>
            )
          }
        />
      </div>

      {/* 30-Day Analytics Chart */}
      {overview && (
        <div className="card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-600" />
                Clicks Over Time (Last 30 Days)
              </h2>
              <p className="text-xs text-slate-500">Visual click activity across all your active short links</p>
            </div>
            <span className="badge badge-brand">
              Real-time Sync
            </span>
          </div>
          <ClicksChart data={overview.daily} />
        </div>
      )}

      {/* Links List Table / Cards */}
      <div className="card">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-brand-600" />
              Your Active Links
            </h2>
            <p className="text-xs text-slate-500">
              {pagination.total ? `${pagination.total} total links created` : "Short links generated"}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              className="input pl-9 pr-3 py-1.5 text-xs"
              placeholder="Search by title or URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner />
            <p className="text-xs text-slate-400">Loading your links...</p>
          </div>
        ) : links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Link2 className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-800">
              {search ? "No matching links found" : "No links created yet"}
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              {search
                ? "Try searching for a different keyword or clear the search box."
                : "Paste your first product or WhatsApp link above to generate a trackable short URL!"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {links.map((link) => (
              <LinkRow key={link._id} link={link} onChange={handleChange} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
            <button
              className="btn-ghost py-1.5 text-xs"
              disabled={pagination.page <= 1}
              onClick={() => loadLinks(pagination.page - 1, search)}
            >
              Previous
            </button>
            <span className="text-xs font-medium text-slate-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              className="btn-ghost py-1.5 text-xs"
              disabled={pagination.page >= pagination.pages}
              onClick={() => loadLinks(pagination.page + 1, search)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
