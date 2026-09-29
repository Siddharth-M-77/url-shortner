import { MessageCircle, ExternalLink, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "./BrandIcons.jsx";
import { BIO_THEMES } from "./bioThemes.js";

// Renders a bio page. Used both on the public page and as a live preview in the editor.
export default function BioView({ page, showBranding = true, compact = false }) {
  const theme = BIO_THEMES[page.theme] || BIO_THEMES.light;
  const initials = (page.displayName || page.username || "?").slice(0, 1).toUpperCase();

  return (
    <div
      className={`${theme.page} ${compact ? "min-h-full rounded-[1.5rem]" : "min-h-screen"} px-5 py-10 transition-colors duration-300 flex flex-col justify-between`}
    >
      <div className="mx-auto flex w-full max-w-sm flex-col items-center text-center">
        {/* Profile Avatar */}
        <div className="relative group">
          {page.avatarUrl ? (
            <img
              src={page.avatarUrl}
              alt={page.displayName || "Avatar"}
              className="h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-white/40 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-white/30 to-white/10 text-3xl font-extrabold shadow-lg ring-4 ring-white/30 backdrop-blur-md">
              {initials}
            </div>
          )}
        </div>

        {/* Display Name with Verified Badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          <h1 className="text-xl font-extrabold tracking-tight">
            {page.displayName || `@${page.username}`}
          </h1>
          <CheckCircle2 className="h-4 w-4 text-sky-400 fill-sky-400/20" />
        </div>

        {/* Username */}
        <p className={`text-xs font-medium ${theme.muted}`}>
          @{page.username || "username"}
        </p>

        {/* Bio Text */}
        {page.bio && (
          <p className={`mt-2.5 text-xs leading-relaxed max-w-xs ${theme.muted}`}>
            {page.bio}
          </p>
        )}

        {/* Main Links Container */}
        <div className="mt-7 w-full space-y-3">
          {/* WhatsApp Primary Button */}
          {page.whatsapp && (
            <a
              href={`https://wa.me/${page.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className={`group flex items-center justify-between w-full rounded-2xl px-5 py-3.5 font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${
                theme.whatsapp || "bg-[#25D366] text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <WhatsAppIcon className="h-5 w-5 fill-current" />
                <span className="text-sm">Chat on WhatsApp</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-1" />
            </a>
          )}

          {/* Custom Link Buttons */}
          {page.links?.map((l, i) => (
            <a
              key={l._id || i}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className={`group flex items-center justify-between w-full rounded-2xl px-5 py-3.5 font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${theme.button}`}
            >
              <span className="truncate pr-2">{l.label || "Untitled Link"}</span>
              <ExternalLink className="h-4 w-4 opacity-60 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
            </a>
          ))}

          {/* Instagram Button */}
          {page.instagram && (
            <a
              href={`https://instagram.com/${page.instagram}`}
              target="_blank"
              rel="noreferrer"
              className={`group flex items-center justify-between w-full rounded-2xl px-5 py-3.5 font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${theme.button}`}
            >
              <div className="flex items-center gap-2.5">
                <InstagramIcon className="h-4 w-4 text-rose-500" />
                <span>@{page.instagram}</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-60 transition-transform group-hover:translate-x-1" />
            </a>
          )}
        </div>
      </div>

      {/* Branding Footer */}
      {showBranding && (
        <div className="mt-8 text-center">
          <a
            href="/"
            className={`inline-flex items-center gap-1.5 rounded-full bg-black/10 px-3 py-1 text-[11px] font-semibold backdrop-blur-md transition hover:bg-black/20 ${theme.muted}`}
          >
            <Sparkles className="h-3 w-3" />
            <span>Made with <strong>Linkzy</strong></span>
          </a>
        </div>
      )}
    </div>
  );
}
