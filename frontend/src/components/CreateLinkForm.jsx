import { useState } from "react";
import toast from "react-hot-toast";
import {
  Link2,
  Sparkles,
  SlidersHorizontal,
  Calendar,
  Tag,
  ArrowRight,
  ClipboardPaste,
  Check,
  Lock,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { PENDING_URL_KEY } from "../content/site.js";

const EMPTY = { originalUrl: "", title: "", customAlias: "", expiresInDays: "" };

// Picks up a URL pasted into the landing page hero (once), so the user doesn't paste it twice
function takePendingUrl() {
  try {
    const url = sessionStorage.getItem(PENDING_URL_KEY) || "";
    sessionStorage.removeItem(PENDING_URL_KEY);
    return url;
  } catch {
    return "";
  }
}

export default function CreateLinkForm({ onCreated }) {
  const { plan, refresh } = useAuth();
  const [form, setForm] = useState(() => ({ ...EMPTY, originalUrl: takePendingUrl() }));
  const [showOptions, setShowOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setForm((prev) => ({ ...prev, originalUrl: text.trim() }));
        toast.success("Pasted from clipboard");
      }
    } catch {
      toast.error("Clipboard permission denied");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Add https:// automatically if the user pasted "example.com"
    let url = form.originalUrl.trim();
    if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;

    const payload = { originalUrl: url };
    if (form.title) payload.title = form.title.trim();
    if (form.customAlias) payload.customAlias = form.customAlias.trim();
    if (form.expiresInDays) payload.expiresInDays = Number(form.expiresInDays);

    try {
      const { data } = await api.post("/links", payload);
      await navigator.clipboard?.writeText(data.link.shortUrl).catch(() => {});
      toast.success("🎉 Short link created and copied to clipboard!");
      setForm(EMPTY);
      setShowOptions(false);
      onCreated?.(data.link);
      refresh(); // update usage counter
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card relative overflow-hidden border-brand-200/60 shadow-lg shadow-brand-500/5 bg-gradient-to-b from-white via-white to-slate-50/50"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Link2 className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Create Short Link
          </span>
        </div>
        <button
          type="button"
          onClick={handlePaste}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-slate-50/80 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
          Paste
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Link2 className="h-4 w-4" />
          </div>
          <input
            className="input pl-10 pr-4 text-sm font-medium"
            placeholder="Paste your long URL here (e.g. https://myshop.com/product/kurti)"
            value={form.originalUrl}
            onChange={update("originalUrl")}
            required
          />
        </div>
        <button
          className="btn-primary sm:w-40 py-2.5 shadow-md shadow-brand-500/20"
          disabled={submitting}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Shortening...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span>Shorten URL</span>
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </button>
      </div>

      {/* Options Accordion Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
        <button
          type="button"
          onClick={() => setShowOptions((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 transition cursor-pointer"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>{showOptions ? "Hide options" : "Custom alias, title & expiration"}</span>
        </button>

        {form.customAlias && (
          <span className="min-w-0 max-w-full truncate text-xs font-mono text-slate-500 sm:max-w-xs">
            Preview: <strong className="text-brand-700">/{form.customAlias}</strong>
          </span>
        )}
      </div>

      {/* Expanded Options */}
      {showOptions && (
        <div className="mt-3 grid gap-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 transition-all sm:grid-cols-3">
          {/* Title */}
          <div>
            <label className="label flex items-center gap-1">
              <Tag className="h-3 w-3" /> Title (optional)
            </label>
            <input
              className="input bg-white text-xs"
              placeholder="e.g. Diwali WhatsApp Blast"
              value={form.title}
              onChange={update("title")}
            />
          </div>

          {/* Custom Alias */}
          <div>
            <div className="flex items-center justify-between">
              <label className="label flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Custom Alias
              </label>
              {!plan?.customAlias && (
                <Link to="/billing" className="text-[10px] font-semibold text-amber-600 hover:underline flex items-center gap-0.5">
                  <Lock className="h-2.5 w-2.5" /> Starter+
                </Link>
              )}
            </div>
            <div className="relative">
              <input
                className="input bg-white text-xs font-mono disabled:bg-slate-100 disabled:text-slate-400"
                placeholder={plan?.customAlias ? "e.g. summer-sale" : "Upgrade to use"}
                value={form.customAlias}
                onChange={update("customAlias")}
                disabled={!plan?.customAlias}
              />
            </div>
          </div>

          {/* Expiration */}
          <div>
            <label className="label flex items-center gap-1">
              <Clock className="h-3 w-3" /> Expires in (days)
            </label>
            <div className="flex items-center gap-2">
              <input
                className="input bg-white text-xs"
                type="number"
                min="1"
                max="3650"
                placeholder="Never (default)"
                value={form.expiresInDays}
                onChange={update("expiresInDays")}
              />
              {/* Quick Presets */}
              <div className="flex gap-1">
                {[7, 30].map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setForm({ ...form, expiresInDays: String(d) })}
                    className={`rounded-lg px-2 py-1.5 text-[10px] font-semibold transition cursor-pointer border ${
                      form.expiresInDays === String(d)
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
