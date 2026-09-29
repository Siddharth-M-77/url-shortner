import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Sparkles,
  Link2,
  Copy,
  Check,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  ExternalLink,
  Smartphone,
  Palette,
  User as UserIcon,
  MessageCircle,
  CheckCircle2,
  Save,
} from "lucide-react";
import { InstagramIcon } from "../components/BrandIcons.jsx";
import { api, errorMessage } from "../api/client.js";
import BioView from "../components/BioView.jsx";
import Spinner from "../components/Spinner.jsx";
import { BIO_THEMES } from "../components/bioThemes.js";

const EMPTY = {
  username: "",
  displayName: "",
  bio: "",
  avatarUrl: "",
  theme: "light",
  whatsapp: "",
  instagram: "",
  links: [],
};

export default function BioEditor() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedUsername, setSavedUsername] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .get("/bio/me")
      .then(({ data }) => {
        if (data.page) {
          setForm({ ...EMPTY, ...data.page });
          setSavedUsername(data.page.username);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const updateLink = (index, field, value) => {
    const links = form.links.map((l, i) => (i === index ? { ...l, [field]: value } : l));
    setForm({ ...form, links });
  };

  const addLink = () => setForm({ ...form, links: [...form.links, { label: "", url: "" }] });
  const removeLink = (index) => setForm({ ...form, links: form.links.filter((_, i) => i !== index) });
  const moveLink = (index, dir) => {
    const links = [...form.links];
    const target = index + dir;
    if (target < 0 || target >= links.length) return;
    [links[index], links[target]] = [links[target], links[index]];
    setForm({ ...form, links });
  };

  const handleCopyPublicUrl = () => {
    if (!publicUrl) return;
    navigator.clipboard?.writeText(publicUrl).then(() => {
      setCopied(true);
      toast.success("Bio link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Normalize URLs and drop empty rows before sending
      const links = form.links
        .filter((l) => l.label.trim() && l.url.trim())
        .map((l) => ({
          label: l.label.trim(),
          url: /^https?:\/\//i.test(l.url.trim()) ? l.url.trim() : `https://${l.url.trim()}`,
        }));

      const payload = {
        username: form.username.trim().toLowerCase(),
        displayName: form.displayName.trim(),
        bio: form.bio.trim(),
        avatarUrl: form.avatarUrl.trim(),
        theme: form.theme,
        whatsapp: form.whatsapp.replace(/\D/g, ""),
        instagram: form.instagram.replace(/^@/, "").trim(),
        links,
      };

      const { data } = await api.put("/bio/me", payload);
      setForm({ ...EMPTY, ...data.page });
      setSavedUsername(data.page.username);
      toast.success("🎉 Bio page updated successfully!");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner full />;
  const publicUrl = savedUsername ? `${window.location.origin}/u/${savedUsername}` : "";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] items-start">
      {/* Left Settings Form */}
      <form onSubmit={handleSave} className="min-w-0 space-y-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Customize Your Bio Page
            </h1>
            <span className="badge badge-brand">
              <Sparkles className="h-3 w-3" /> Live Sync
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            One beautiful mobile storefront for your Instagram bio, WhatsApp catalog and social channels.
          </p>

          {publicUrl && (
            <div className="mt-3 flex flex-col gap-2 rounded-xl border border-brand-200 bg-brand-50/80 px-4 py-2.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-col gap-0.5 text-xs sm:flex-row sm:items-center sm:gap-2">
                <span className="flex-shrink-0 font-semibold text-brand-900">Your Public URL:</span>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center gap-1 font-mono font-bold text-brand-700 hover:underline"
                >
                  <span className="break-all">{publicUrl}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </div>
              <button
                type="button"
                onClick={handleCopyPublicUrl}
                className="btn-ghost self-start py-1 px-2.5 text-xs bg-white cursor-pointer sm:self-auto sm:flex-shrink-0"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="card space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
            <UserIcon className="h-4 w-4 text-brand-600" />
            Profile Information
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Username</label>
              <div className="relative">
                <input
                  className="input pl-7 font-mono text-xs"
                  required
                  placeholder="myshop"
                  value={form.username}
                  onChange={update("username")}
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">@</span>
              </div>
            </div>

            <div>
              <label className="label">Display Name</label>
              <input
                className="input text-xs"
                placeholder="e.g. Ananya Crafts & Kurtis"
                value={form.displayName}
                onChange={update("displayName")}
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="label mb-0">Bio / Tagline</label>
                <span className="text-[10px] text-slate-400 font-medium">
                  {form.bio?.length || 0}/200
                </span>
              </div>
              <textarea
                className="input text-xs"
                rows={2}
                maxLength={200}
                placeholder="Handmade festive collections · Pan India Express Shipping 🇮🇳"
                value={form.bio}
                onChange={update("bio")}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Profile Photo URL</label>
              <input
                className="input text-xs"
                placeholder="https://images.unsplash.com/... or your logo URL"
                value={form.avatarUrl}
                onChange={update("avatarUrl")}
              />
            </div>
          </div>
        </div>

        {/* Social Channels Card */}
        <div className="card space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            Connect WhatsApp & Instagram
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">WhatsApp Number (with country code)</label>
              <input
                className="input text-xs font-mono"
                placeholder="919876543210 (without + or spaces)"
                value={form.whatsapp}
                onChange={update("whatsapp")}
              />
              <p className="mt-1 text-[11px] text-slate-400">Enables direct 1-tap WhatsApp chat button</p>
            </div>

            <div>
              <label className="label">Instagram Handle</label>
              <div className="relative">
                <input
                  className="input pl-7 text-xs font-mono"
                  placeholder="ananyacrafts"
                  value={form.instagram}
                  onChange={update("instagram")}
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">@</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Links directly to your Instagram profile</p>
            </div>
          </div>
        </div>

        {/* Theme Picker */}
        <div className="card space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
            <Palette className="h-4 w-4 text-purple-600" />
            Theme & Appearance
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(BIO_THEMES).map(([t, themeObj]) => (
              <button
                type="button"
                key={t}
                onClick={() => setForm({ ...form, theme: t })}
                className={`relative flex items-center gap-2.5 rounded-xl border p-3 text-left transition cursor-pointer ${
                  form.theme === t
                    ? "border-brand-600 ring-2 ring-brand-500/20 bg-brand-50/40"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full border border-slate-300 flex-shrink-0 shadow-xs"
                  style={{ backgroundColor: themeObj.color }}
                />
                <span className="text-xs font-bold text-slate-800 line-clamp-1">
                  {themeObj.label || t}
                </span>
                {form.theme === t && (
                  <Check className="h-3.5 w-3.5 text-brand-600 ml-auto flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Links Manager Card */}
        <div className="card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Link2 className="h-4 w-4 text-brand-600" />
              Links & Catalog Items ({form.links.length}/20)
            </h2>
            <button
              type="button"
              className="btn-ghost py-1 px-3 text-xs"
              onClick={addLink}
              disabled={form.links.length >= 20}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Link</span>
            </button>
          </div>

          {form.links.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Link2 className="mx-auto h-6 w-6 stroke-1 text-slate-300" />
              <p className="mt-2 text-xs">No custom links added yet. Click &quot;Add Link&quot; above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {form.links.map((l, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 sm:flex-row sm:items-center"
                >
                  <input
                    className="input bg-white text-xs sm:w-44"
                    placeholder="Link Label (e.g. Festive Sale)"
                    value={l.label}
                    onChange={(e) => updateLink(i, "label", e.target.value)}
                  />
                  <input
                    className="input bg-white text-xs flex-1"
                    placeholder="https://..."
                    value={l.url}
                    onChange={(e) => updateLink(i, "url", e.target.value)}
                  />
                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <button
                      type="button"
                      className="btn-ghost px-2 py-1 text-xs"
                      onClick={() => moveLink(i, -1)}
                      disabled={i === 0}
                      title="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="btn-ghost px-2 py-1 text-xs"
                      onClick={() => moveLink(i, 1)}
                      disabled={i === form.links.length - 1}
                      title="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="btn-danger px-2 py-1 text-xs cursor-pointer"
                      onClick={() => removeLink(i)}
                      title="Delete link"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          className="btn-primary w-full py-3.5 text-base shadow-lg shadow-brand-500/25 cursor-pointer"
          disabled={saving}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving changes...
            </span>
          ) : (
            <span className="flex items-center gap-2 font-bold">
              <Save className="h-4 w-4" />
              Save Bio Page
            </span>
          )}
        </button>
      </form>

      {/* Right Smartphone Live Preview */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Smartphone className="h-3.5 w-3.5 text-brand-600" />
            Live Mobile Preview
          </p>
          <span className="badge badge-emerald text-[10px]">Real-time</span>
        </div>

        {/* Smartphone Shell with dynamic island and frame */}
        <div className="relative mx-auto w-full max-w-[340px] rounded-[2.8rem] border-[10px] border-slate-900 bg-slate-900 p-1.5 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.4)]">
          {/* Dynamic Island Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 h-4 w-24 rounded-full bg-black/80 flex items-center justify-end pr-2">
            <span className="h-2 w-2 rounded-full bg-slate-800" />
          </div>

          {/* Screen Content */}
          <div className="h-[560px] sm:h-[620px] overflow-y-auto rounded-[2.2rem] bg-white scrollbar-none">
            <BioView
              page={{ ...form, username: form.username || "yourshop" }}
              compact
            />
          </div>

          {/* Home indicator bar */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 h-1 w-28 rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  );
}
