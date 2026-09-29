import {
  Globe,
  Smartphone,
  Laptop,
  Tablet,
  MessageCircle,
  Compass,
  Layers,
  MapPin,
  QrCode,
  Mail,
  Send,
  Link2,
} from "lucide-react";
import { InstagramIcon } from "./BrandIcons.jsx";

function getItemIcon(key = "", title = "") {
  const k = key.toLowerCase();
  const t = title.toLowerCase();

  if (t.includes("device")) {
    if (k.includes("mobile")) return Smartphone;
    if (k.includes("tablet")) return Tablet;
    return Laptop;
  }

  if (t.includes("source") || t.includes("referrer")) {
    if (k.includes("insta")) return InstagramIcon;
    if (k.includes("whats") || k.includes("wa.me")) return MessageCircle;
    if (k === "qr") return QrCode;
    if (k === "email") return Mail;
    if (k === "telegram" || k === "sms") return Send;
    if (k === "direct") return Link2;
    return Globe;
  }

  if (t.includes("country")) {
    return MapPin;
  }

  return Compass;
}

export default function BreakdownList({ title, items = [] }) {
  const total = items.reduce((acc, cur) => acc + (cur.count || 0), 0);
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <div className="card flex flex-col justify-between">
      <div>
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <span className="text-xs font-semibold text-slate-400">
            {total.toLocaleString("en-IN")} total
          </span>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
            <Layers className="h-6 w-6 stroke-1 text-slate-300" />
            <p className="mt-2 text-xs">No analytics data recorded yet</p>
          </div>
        ) : (
          <ul className="space-y-3.5">
            {items.map((item) => {
              const Icon = getItemIcon(item.key, title);
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              const barWidth = Math.min(100, Math.max(4, (item.count / max) * 100));

              return (
                <li key={item.key} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex min-w-0 items-center gap-1.5 font-medium text-slate-700 capitalize">
                      <Icon className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{item.key || "Direct / Unknown"}</span>
                    </span>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {item.count.toLocaleString("en-IN")}
                      </span>
                      <span className="w-8 text-right text-[11px] text-slate-400">
                        {pct}%
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
