import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Spinner from "./components/Spinner.jsx";
import { useSeo } from "./utils/useSeo.js";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Report from "./pages/Report.jsx";
import NotFound from "./pages/NotFound.jsx";

// Private pages (and their heavy deps like recharts) load only when opened,
// so the public landing page stays small and fast.
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const LinkStats = lazy(() => import("./pages/LinkStats.jsx"));
const BioEditor = lazy(() => import("./pages/BioEditor.jsx"));
const Billing = lazy(() => import("./pages/Billing.jsx"));
const Admin = lazy(() => import("./pages/Admin.jsx"));
const PublicBio = lazy(() => import("./pages/PublicBio.jsx"));
import { Terms, Privacy, Refund, Contact } from "./pages/Policies.jsx";

// Redirects to login when there is no session
function Protected({ children, admin = false }) {
  const { user, loading } = useAuth();
  // Private app pages should never show up in search results
  useSeo({ title: "Dashboard", noindex: true });
  if (loading) return <Spinner full />;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <Suspense fallback={<Spinner full />}>{children}</Suspense>;
}

// Keeps logged-in users away from login/register pages. The form shows right away
// (it is prerendered for SEO); a signed-in user is redirected once the session check ends.
function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  return !loading && user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      {/* Public bio page has its own full-screen design, no app layout */}
      <Route
        path="/u/:username"
        element={
          <Suspense fallback={<Spinner full />}>
            <PublicBio />
          </Suspense>
        }
      />

      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
        <Route path="/report" element={<Report />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/links/:id" element={<Protected><LinkStats /></Protected>} />
        <Route path="/bio" element={<Protected><BioEditor /></Protected>} />
        <Route path="/billing" element={<Protected><Billing /></Protected>} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
