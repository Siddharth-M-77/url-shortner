import { Link } from "react-router-dom";
import { Link2Off, ArrowLeft, Home } from "lucide-react";

// Also used by the backend when a short link is missing, expired or blocked
export default function NotFound() {
  return (
    <div className="py-16 sm:py-24 text-center max-w-md mx-auto">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-500 border border-rose-200 shadow-sm">
        <Link2Off className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Link Not Found</h1>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
        This link might have expired, been paused by its creator, or was removed for violating our community safety guidelines.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/" className="btn-primary py-2.5 px-5 text-xs">
          <Home className="h-4 w-4" /> Go to Linkzy Home
        </Link>
      </div>
    </div>
  );
}
