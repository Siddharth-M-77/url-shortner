import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldAlert, CheckCircle2, ArrowLeft, Send, AlertTriangle } from "lucide-react";
import { api, errorMessage } from "../api/client.js";

export default function Report() {
  const [form, setForm] = useState({ link: "", reason: "phishing", details: "" });
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const shortCode = form.link.trim().replace(/\/+$/, "").split("/").pop();
    if (!shortCode) return toast.error("Enter the short link");

    setSubmitting(true);
    try {
      await api.post("/reports", { shortCode, reason: form.reason, details: form.details });
      setDone(true);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="card mx-auto max-w-md text-center py-12 px-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-slate-900">Report Received</h1>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          Thank you for helping keep the Indian web safe. Our automated security bot and compliance team will review and terminate malicious links within minutes.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex text-xs py-2.5">
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-4 sm:py-8">
      <div className="text-center mb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80 shadow-xs">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
          Report a Suspicious Link
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Linkzy maintains zero tolerance for phishing, scams, financial fraud, and malware.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 border-slate-200/90 shadow-lg shadow-slate-100">
        <div>
          <label className="label">Short Link or URL</label>
          <input
            className="input text-xs font-mono"
            required
            placeholder="https://linkzy.in/xyz or just xyz"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Abuse Reason</label>
          <select
            className="input text-xs cursor-pointer"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          >
            <option value="phishing">Phishing / Fake Login or Banking Portal</option>
            <option value="malware">Malware / Virus / APK Download</option>
            <option value="spam">Spam / Bulk Unsolicited Messages</option>
            <option value="other">Other Violation</option>
          </select>
        </div>

        <div>
          <label className="label">Additional Details (Optional)</label>
          <textarea
            className="input text-xs"
            rows={3}
            maxLength={500}
            placeholder="Explain where you found this link or how it impersonates a genuine service..."
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
          />
        </div>

        <button
          className="btn-danger w-full py-3 text-xs font-bold cursor-pointer"
          disabled={submitting}
        >
          {submitting ? "Submitting report..." : "Submit Abuse Report"}
        </button>
      </form>
    </div>
  );
}
