import { useState } from "react";
import toast from "react-hot-toast";
import { Check, CirclePlay, Copy, Mail, Send, Share2, ThumbsUp } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "./BrandIcons.jsx";

// Each channel gets its own ?s= tag so clicks are attributed even when the app
// sends no Referer (WhatsApp, iPhone apps, email). The backend reads ?s= on redirect.
const CHANNELS = [
  { key: "instagram", label: "Instagram", icon: InstagramIcon, color: "text-rose-600" },
  { key: "facebook", label: "Facebook", icon: ThumbsUp, color: "text-blue-600" },
  { key: "youtube", label: "YouTube", icon: CirclePlay, color: "text-red-600" },
  { key: "telegram", label: "Telegram", icon: Send, color: "text-sky-600" },
  { key: "email", label: "Email", icon: Mail, color: "text-slate-600" },
];

export default function ShareTrackedLinks({ shortUrl }) {
  const [copied, setCopied] = useState("");
  const tagged = (source) => `${shortUrl}?s=${source}`;

  const copy = async (source) => {
    try {
      await navigator.clipboard.writeText(tagged(source));
      setCopied(source);
      toast.success("Tracking link copied!");
      setTimeout(() => setCopied(""), 2000);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="card">
      <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Share2 className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-900">Share & track by app</h2>
          <p className="text-xs text-slate-500">
            WhatsApp and most phone apps don't tell us where a click came from. Share these links instead of the plain one
            and each click shows up under the right source.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(tagged("whatsapp"))}`}
          target="_blank"
          rel="noreferrer"
          className="btn flex-shrink-0 bg-[#25D366] text-white shadow-sm hover:bg-[#1ebe5b]"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Share on WhatsApp
        </a>
        <button type="button" onClick={() => copy("whatsapp")} className="btn-ghost flex-shrink-0 text-xs">
          {copied === "whatsapp" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          Copy WhatsApp link
        </button>
        <code className="min-w-0 truncate rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-500 ring-1 ring-slate-200">
          {tagged("whatsapp").replace(/^https?:\/\//, "")}
        </code>
      </div>

      <p className="mt-5 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Copy a link for</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {CHANNELS.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => copy(c.key)}
            className="btn-ghost justify-start px-3 py-2 text-xs"
            title={tagged(c.key)}
          >
            {copied === c.key ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <c.icon className={`h-3.5 w-3.5 ${c.color}`} />
            )}
            {c.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-slate-400">
        QR codes from this page are tagged automatically, so scans show up as “qr”. You can also add your own label, e.g.{" "}
        <code className="text-slate-500">?s=diwali-poster</code>.
      </p>
    </div>
  );
}
