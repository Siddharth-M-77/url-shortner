import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Zap,
  Calendar,
  Clock,
  ArrowRight,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { api, errorMessage } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { loadRazorpay } from "../utils/loadRazorpay.js";
import Spinner from "../components/Spinner.jsx";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "–";

const STATUS_LABEL = {
  active: "Active",
  authenticated: "Starting",
  pending: "Payment retrying",
  halted: "Payment failed",
  cancelled: "Cancelled",
  completed: "Completed",
  paused: "Paused",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Billing() {
  const { user, refresh: refreshAuth } = useAuth();
  const [billing, setBilling] = useState(null);
  const [plans, setPlans] = useState([]);
  const [busyPlan, setBusyPlan] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    const [{ data: b }, { data: p }] = await Promise.all([api.get("/billing"), api.get("/plans")]);
    setBilling(b);
    setPlans(p.plans);
    return b;
  }, []);

  useEffect(() => {
    load().catch((err) => toast.error(errorMessage(err)));
  }, [load]);

  // After checkout the webhook may take a few seconds to activate the plan; poll until it does
  const waitForActivation = async (planKey) => {
    for (let i = 0; i < 10; i += 1) {
      const b = await load();
      if (b.currentPlan === planKey) return true;
      await sleep(2000);
    }
    return false;
  };

  const subscribe = async (planKey) => {
    setBusyPlan(planKey);
    try {
      const [Razorpay, { data: order }] = await Promise.all([
        loadRazorpay(),
        api.post("/billing/subscribe", { plan: planKey }),
      ]);

      const checkout = new Razorpay({
        key: order.keyId,
        subscription_id: order.subscriptionId,
        name: order.name,
        description: order.description,
        prefill: order.prefill,
        theme: { color: "#4f46e5" },
        handler: async (response) => {
          const toastId = toast.loading("Confirming your payment...");
          try {
            const { data } = await api.post("/billing/verify", response);
            const activated = data.active || (await waitForActivation(planKey));
            await refreshAuth();
            await load();
            if (activated) {
              toast.success("🎉 Payment successful! Your plan is now active.", { id: toastId });
            } else {
              toast.success("Payment received. Your plan will activate within 60 seconds.", { id: toastId });
            }
          } catch (err) {
            toast.error(errorMessage(err), { id: toastId });
          } finally {
            setBusyPlan("");
          }
        },
        modal: {
          ondismiss: () => setBusyPlan(""),
        },
      });

      checkout.on("payment.failed", (resp) => {
        toast.error(resp?.error?.description || "Payment failed. Please try again.");
      });
      checkout.open();
    } catch (err) {
      toast.error(errorMessage(err));
      setBusyPlan("");
    }
  };

  const cancel = async () => {
    if (!window.confirm("Cancel auto-renewal? You will keep your plan until the end of this billing cycle.")) return;
    setCancelling(true);
    try {
      const { data } = await api.post("/billing/cancel");
      toast.success(`Cancelled. You keep full access until ${formatDate(data.accessUntil)}.`);
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  if (!billing) return <Spinner full />;

  const sub = billing.subscription;
  const canCancel = sub && ["active", "authenticated", "pending"].includes(sub.status) && !sub.cancelAtPeriodEnd;
  const currentPlan = plans.find((p) => p.key === billing.currentPlan);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Billing & Subscription
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Manage your subscription tier, billing period, and past invoices.
        </p>
      </div>

      {!billing.configured && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <span>
            Payment gateway in setup mode. Add Razorpay API credentials in backend environment to accept live payments.
          </span>
        </div>
      )}

      {/* Current Plan Overview Card */}
      <div className="card relative overflow-hidden flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-brand-200/80 bg-gradient-to-r from-white via-white to-brand-50/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Plan</span>
            <span className="badge badge-brand">
              {currentPlan?.name || "Free"} Tier
            </span>
          </div>

          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {currentPlan?.name || "Free Forever"}
          </p>

          {billing.currentPlan !== "free" && (
            <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5 pt-1">
              <Calendar className="h-3.5 w-3.5 text-brand-600" />
              {sub?.cancelAtPeriodEnd || ["cancelled", "halted", "completed"].includes(sub?.status)
                ? `Access remains active until ${formatDate(billing.planExpiresAt)}`
                : `Renews automatically on ${formatDate(sub?.currentEnd)}`}
            </p>
          )}

          {sub && (
            <p className="text-[11px] text-slate-500">
              Subscription status: <strong className="capitalize text-slate-700">{STATUS_LABEL[sub.status] || sub.status}</strong>
              {sub.cancelAtPeriodEnd && " (Auto-renewal stopped)"}
            </p>
          )}

          {sub?.status === "halted" && (
            <p className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5" />
              Auto-debit failed. Please re-subscribe to maintain uninterrupted active link routing.
            </p>
          )}
        </div>

        {canCancel && (
          <button
            className="btn-danger self-start sm:self-auto py-2 text-xs cursor-pointer"
            onClick={cancel}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Cancel auto-renewal"}
          </button>
        )}
      </div>

      {/* Plan Cards Grid */}
      <div className="grid gap-6 md:grid-cols-3 items-stretch">
        {plans.map((p) => {
          const isCurrent = p.key === billing.currentPlan;
          const isStarter = p.key === "starter";
          const renewing = isCurrent && sub && !sub.cancelAtPeriodEnd && ["active", "authenticated"].includes(sub.status);

          return (
            <div
              key={p.key}
              className={`relative flex flex-col justify-between rounded-3xl border bg-white p-7 transition-all ${
                isStarter
                  ? "border-brand-500 shadow-xl shadow-brand-500/10 ring-2 ring-brand-500/20"
                  : isCurrent
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                    : "border-slate-200 shadow-xs hover:shadow-md"
              }`}
            >
              {isStarter && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 px-3.5 py-0.5 text-xs font-bold text-white shadow-md">
                  ⭐ Recommended
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                  {isCurrent && (
                    <span className="badge badge-emerald text-[10px]">Your Plan</span>
                  )}
                </div>

                <p className="mt-3 flex items-baseline gap-1 text-slate-900">
                  <span className="text-3xl font-extrabold tracking-tight">₹{p.price}</span>
                  <span className="text-xs font-medium text-slate-500">/ month</span>
                </p>

                <div className="my-5 h-px bg-slate-100" />

                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>{p.linksPerMonth === null ? "Unlimited" : p.linksPerMonth} links / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      {p.trackedClicksPerMonth === null
                        ? "Unlimited"
                        : p.trackedClicksPerMonth.toLocaleString("en-IN")}{" "}
                      tracked clicks / month
                    </span>
                  </li>
                  <li className={`flex items-center gap-2 ${p.customAlias ? "text-slate-800" : "text-slate-400"}`}>
                    {p.customAlias ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] text-slate-400 flex-shrink-0">✕</span>
                    )}
                    <span>Custom branded aliases</span>
                  </li>
                  <li className={`flex items-center gap-2 ${p.removeBranding ? "text-slate-800" : "text-slate-400"}`}>
                    {p.removeBranding ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] text-slate-400 flex-shrink-0">✕</span>
                    )}
                    <span>Remove Linkzy branding</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                {p.key === "free" ? (
                  <button className="btn-ghost w-full py-2.5 text-xs" disabled>
                    {isCurrent ? "Active Plan" : "Free Forever"}
                  </button>
                ) : renewing ? (
                  <button className="btn-ghost w-full py-2.5 text-xs text-emerald-700 bg-emerald-50 border-emerald-200" disabled>
                    ✓ Current Subscription
                  </button>
                ) : (
                  <button
                    className="btn-primary w-full py-2.5 text-xs shadow-md shadow-brand-500/20"
                    onClick={() => subscribe(p.key)}
                    disabled={!billing.configured || Boolean(busyPlan)}
                  >
                    {busyPlan === p.key
                      ? "Opening Razorpay..."
                      : isCurrent
                        ? "Resubscribe"
                        : billing.currentPlan === "free"
                          ? `Upgrade to ${p.name}`
                          : `Switch to ${p.name}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 rounded-xl bg-slate-100/70 p-3.5 gap-2">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Prices in INR. Billed monthly via UPI Autopay, Cards or Netbanking with instant activation.
        </span>
        <Link to="/refund" className="font-semibold text-brand-600 hover:underline">
          View Refund Policy →
        </Link>
      </div>

      {/* Payment History Table */}
      <div className="card">
        <h2 className="mb-4 text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
          <CreditCard className="h-4 w-4 text-brand-600" />
          Payment & Transaction History
        </h2>

        {billing.payments.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-400">
            No payments recorded yet under this account.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5">Date</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Transaction ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {billing.payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-medium text-slate-800">{formatDate(pay.paidAt)}</td>
                    <td className="capitalize font-semibold text-slate-900">{pay.plan}</td>
                    <td className="font-bold text-slate-900">₹{pay.amount.toLocaleString("en-IN")}</td>
                    <td>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                        {pay.method || "UPI"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          pay.status === "failed" ? "badge-rose" : "badge-emerald"
                        }`}
                      >
                        {pay.status === "failed" ? "Failed" : "Paid"}
                      </span>
                    </td>
                    <td className="font-mono text-[11px] text-slate-400">{pay.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
