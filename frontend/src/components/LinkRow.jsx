import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Link2,
  Copy,
  Check,
  BarChart3,
  QrCode,
  Pause,
  Play,
  Trash2,
  ExternalLink,
  Clock,
  Calendar,
  MousePointerClick,
} from "lucide-react";
import { api, errorMessage } from "../api/client.js";

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function LinkRow({ link, onChange, onDelete }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link.shortUrl);
      setCopied(true);
      toast.success("Short URL copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy");
    }
  };

  const toggleActive = async () => {
    try {
      const { data } = await api.patch(`/links/${link._id}`, { isActive: !link.isActive });
      onChange(data.link);
      toast.success(data.link.isActive ? "Link activated" : "Link paused");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this link? Its analytics will also be permanently deleted.")) return;
    try {
      await api.delete(`/links/${link._id}`);
      onDelete(link._id);
      toast.success("Link deleted");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const expired = link.expiresAt && new Date(link.expiresAt) < new Date();
  const status = link.isBlocked ? "Blocked" : expired ? "Expired" : link.isActive ? "Active" : "Paused";

  const statusBadge = {
    Active: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      dot: "bg-emerald-500",
      ping: true,
    },
    Paused: {
      bg: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
      ping: false,
    },
    Expired: {
      bg: "bg-amber-50 text-amber-700 border-amber-200/80",
      dot: "bg-amber-500",
      ping: false,
    },
    Blocked: {
      bg: "bg-rose-50 text-rose-700 border-rose-200/80",
      dot: "bg-rose-500",
      ping: false,
    },
  }[status];

  return (
    <div className="group flex flex-col gap-4 py-4 transition-colors hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between px-2 rounded-xl">
      {/* Left Details */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={link.shortUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 font-bold text-brand-600 hover:text-brand-800 transition-colors text-base"
          >
            <Link2 className="h-4 w-4" />
            <span>{link.shortUrl.replace(/^https?:\/\//, "")}</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>

          {/* Status Badge with Ping */}
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${statusBadge.bg}`}>
            <span className="relative flex h-2 w-2">
              {statusBadge.ping && (
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${statusBadge.dot}`} />
              )}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${statusBadge.dot}`} />
            </span>
            {status}
          </span>
        </div>

        {/* Title if present */}
        {link.title && (
          <p className="text-sm font-semibold text-slate-800 line-clamp-1">{link.title}</p>
        )}

        {/* Destination URL */}
        <p className="truncate text-xs text-slate-500 font-mono" title={link.originalUrl}>
          → {link.originalUrl}
        </p>

        {/* Meta Timestamps */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Created {formatDate(link.createdAt)}
          </span>
          {link.expiresAt && (
            <span className="flex items-center gap-1 text-amber-600">
              <Clock className="h-3 w-3" />
              Expires {formatDate(link.expiresAt)}
            </span>
          )}
        </div>
      </div>

      {/* Right Actions & Clicks Metric */}
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {/* Click Count Pill */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 shadow-2xs">
          <MousePointerClick className="h-3.5 w-3.5 text-brand-600" />
          <span className="text-xs font-bold text-slate-900">{link.clicks.toLocaleString("en-IN")}</span>
          <span className="text-[11px] text-slate-500">clicks</span>
        </div>

        {/* Copy Button */}
        <button
          onClick={copy}
          className="btn-ghost px-3 py-1.5 text-xs"
          title="Copy short link"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>

        {/* Analytics Stats */}
        <Link
          to={`/links/${link._id}`}
          className="btn-ghost px-3 py-1.5 text-xs"
          title="View detailed analytics"
        >
          <BarChart3 className="h-3.5 w-3.5 text-brand-600" />
          <span>Stats</span>
        </Link>

        {/* QR Code */}
        <a
          href={`/api/links/${link._id}/qr`}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost px-3 py-1.5 text-xs"
          title="View QR Code"
        >
          <QrCode className="h-3.5 w-3.5 text-slate-700" />
          <span>QR</span>
        </a>

        {/* Pause / Resume */}
        {!link.isBlocked && (
          <button
            onClick={toggleActive}
            className="btn-ghost px-2.5 py-1.5 text-xs"
            title={link.isActive ? "Pause link redirection" : "Resume link redirection"}
          >
            {link.isActive ? <Pause className="h-3.5 w-3.5 text-slate-600" /> : <Play className="h-3.5 w-3.5 text-emerald-600" />}
          </button>
        )}

        {/* Delete */}
        <button
          onClick={remove}
          className="btn-danger px-2.5 py-1.5 text-xs cursor-pointer"
          title="Delete link permanently"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
