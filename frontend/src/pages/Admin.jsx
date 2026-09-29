import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  ShieldAlert,
  Users as UsersIcon,
  Link2,
  MousePointerClick,
  AlertTriangle,
  Search,
  CheckCircle2,
  Ban,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { api, errorMessage } from "../api/client.js";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");

  const loadReports = useCallback(() => {
    api.get("/admin/reports").then(({ data }) => setReports(data.reports)).catch((e) => toast.error(errorMessage(e)));
  }, []);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data)).catch(() => {});
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    const t = setTimeout(() => {
      api.get("/admin/users", { params: { search: userSearch } }).then(({ data }) => setUsers(data.users)).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [userSearch]);

  const resolve = async (id, action) => {
    if (action === "ban" && !window.confirm("Ban this user and block ALL their links?")) return;
    try {
      await api.post(`/admin/reports/${id}/resolve`, { action });
      toast.success("Action applied");
      loadReports();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const setPlan = async (userId, plan) => {
    try {
      const { data } = await api.patch(`/admin/users/${userId}/plan`, { plan, months: 1 });
      setUsers((prev) => prev.map((u) => (u._id === userId ? data.user : u)));
      toast.success(`Plan set to ${plan}`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-brand-600" />
          Admin Command Center
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Monitor system metrics, review flagged abuse reports, and administer customer plans.
        </p>
      </div>

      {stats && (
        <div className="grid gap-5 sm:grid-cols-4">
          {[
            { label: "Total Users", value: stats.users, icon: UsersIcon, color: "text-blue-600 bg-blue-50 border-blue-200" },
            { label: "Active Links", value: stats.links, icon: Link2, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
            { label: "Total Clicks", value: stats.totalClicks, icon: MousePointerClick, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
            { label: "Open Reports", value: stats.openReports, icon: AlertTriangle, color: stats.openReports > 0 ? "text-rose-600 bg-rose-50 border-rose-200" : "text-slate-600 bg-slate-50 border-slate-200" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="card card-hover flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    {item.value.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Abuse Reports Section */}
      <section className="card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            Open Abuse & Phishing Reports ({reports.length})
          </h2>
          <span className="badge badge-rose text-[10px]">High Priority</span>
        </div>

        {reports.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
            <p className="mt-2 text-xs font-semibold text-slate-600">Zero open abuse reports 🎉</p>
            <p className="text-[11px] text-slate-400">All short links comply with terms of service.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map((r) => (
              <div key={r._id} className="flex flex-col gap-3 py-3.5 md:flex-row md:items-center">
                <div className="min-w-0 flex-1 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-700">/{r.shortCode}</span>
                    <span className="badge badge-rose text-[10px]">{r.reason}</span>
                  </div>
                  {r.link ? (
                    <p className="truncate text-slate-500 font-mono">
                      → {r.link.originalUrl} · Owner: <strong>{r.link.user?.email}</strong>
                    </p>
                  ) : (
                    <p className="text-slate-400 italic">Target link already deleted</p>
                  )}
                  {r.details && (
                    <p className="rounded-lg bg-slate-50 p-2 text-slate-700 text-[11px] italic">
                      &ldquo;{r.details}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button className="btn-ghost py-1 px-3 text-xs" onClick={() => resolve(r._id, "dismiss")}>
                    Dismiss
                  </button>
                  <button className="btn-danger py-1 px-3 text-xs" onClick={() => resolve(r._id, "block")}>
                    Block Link
                  </button>
                  <button className="btn-danger py-1 px-3 text-xs bg-rose-600 text-white hover:bg-rose-700" onClick={() => resolve(r._id, "ban")}>
                    <Ban className="h-3.5 w-3.5" />
                    Ban User
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* User Management Section */}
      <section className="card space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-brand-600" />
            Registered Users ({users.length})
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              className="input pl-9 pr-3 py-1.5 text-xs"
              placeholder="Search user email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5">User</th>
                <th>Current Plan</th>
                <th>Expiration</th>
                <th>Status</th>
                <th>Grant Plan (1 Mo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/60">
                  <td className="py-3 font-medium text-slate-900">{u.email}</td>
                  <td>
                    <span className="badge badge-brand capitalize text-[10px]">
                      {u.plan}
                    </span>
                  </td>
                  <td className="text-slate-500">
                    {u.planExpiresAt ? new Date(u.planExpiresAt).toLocaleDateString("en-IN") : "–"}
                  </td>
                  <td>
                    {u.isBanned ? (
                      <span className="badge badge-rose text-[10px]">Banned</span>
                    ) : (
                      <span className="badge badge-emerald text-[10px]">Active</span>
                    )}
                  </td>
                  <td>
                    <select
                      className="input py-1 text-xs w-32 cursor-pointer"
                      value={u.plan}
                      onChange={(e) => setPlan(u._id, e.target.value)}
                    >
                      <option value="free">Free</option>
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
