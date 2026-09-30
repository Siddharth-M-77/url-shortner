// Terms, Privacy, Refund and Contact pages required for Razorpay approval.
// These are templates: review them (ideally with a lawyer) and fill src/config/business.js.
import { BUSINESS as B } from "../config/business.js";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useSeo } from "../utils/useSeo.js";

function PolicyLayout({ title, children }) {
  const { pathname } = useLocation();
  useSeo({ title, description: `${title} for ${B.brand}, the URL shortener, QR code and link-in-bio service.`, path: pathname });
  return (
    <article className="card mx-auto max-w-3xl space-y-6 break-words text-sm leading-relaxed text-slate-700 shadow-md">
      <div className="border-b border-slate-100 pb-4">
        <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 flex-shrink-0 text-brand-600" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        </div>
        <p className="mt-1 text-xs text-slate-400">Last updated: {B.lastUpdated}</p>
      </div>
      <div className="space-y-4 [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-900 [&_li]:ml-5 [&_li]:list-disc [&_li]:mt-1">
        {children}
      </div>
    </article>
  );
}

export function Terms() {
  return (
    <PolicyLayout title="Terms and Conditions">
      <p>
        These terms govern your use of {B.brand} ({B.website}), operated by {B.legalName} ("we", "us"). By creating an
        account or using the service you agree to these terms.
      </p>
      <h2>1. The service</h2>
      <p>{B.brand} lets you create short links, QR codes, a link-in-bio page, and view click analytics.</p>
      <h2>2. Accounts</h2>
      <ul>
        <li>You must provide accurate information and keep your password secure.</li>
        <li>You are responsible for all activity under your account.</li>
      </ul>
      <h2>3. Acceptable use</h2>
      <p>You must not use {B.brand} to link to or distribute:</p>
      <ul>
        <li>Phishing, scams, malware, or fake login/payment pages</li>
        <li>Illegal content, or content that infringes someone else's rights</li>
        <li>Spam or unsolicited bulk messages</li>
      </ul>
      <p>
        We may disable links or suspend accounts that break these rules, without notice and without refund.
      </p>
      <h2>4. Plans and payments</h2>
      <ul>
        <li>Paid plans are billed monthly in advance in Indian Rupees (INR) through Razorpay.</li>
        <li>Subscriptions renew automatically until cancelled. You can cancel anytime from the Billing page.</li>
        <li>Prices may change with at least 15 days' notice by email. Changes apply from the next billing cycle.</li>
        <li>Refunds are governed by our Refund and Cancellation Policy.</li>
      </ul>
      <h2>5. Availability</h2>
      <p>
        We aim for high uptime but do not guarantee the service will be uninterrupted or error-free.
      </p>
      <h2>6. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, our total liability for any claim is limited to the amount you paid us
        in the 3 months before the claim.
      </p>
      <h2>7. Governing law</h2>
      <p>These terms are governed by the laws of India. Courts in {B.jurisdiction} have exclusive jurisdiction.</p>
      <h2>8. Contact</h2>
      <p>Questions about these terms: {B.email}</p>
    </PolicyLayout>
  );
}

export function Privacy() {
  return (
    <PolicyLayout title="Privacy Policy">
      <p>
        This policy explains what data {B.legalName} collects through {B.brand} and how it is used.
      </p>
      <h2>Data we collect</h2>
      <ul>
        <li><strong>Account data:</strong> name, email address, and a hashed password.</li>
        <li><strong>Links you create:</strong> destination URLs, titles, and bio page content.</li>
        <li>
          <strong>Click data:</strong> when someone opens a short link we record the time, referring website, device
          type, browser, operating system, and approximate location (country, state and city). The location is worked
          out from the visitor's IP address at the moment of the click; the IP address itself is not stored. Location
          data comes from GeoLite2 by MaxMind (https://www.maxmind.com).
        </li>
        <li>
          <strong>Payment data:</strong> payments are processed by Razorpay. We receive payment ids, amount, status and
          method, but never your full card, UPI PIN, or bank credentials.
        </li>
      </ul>
      <h2>How we use data</h2>
      <ul>
        <li>To provide the service and show you analytics</li>
        <li>To process payments and send billing emails</li>
        <li>To detect and block abuse such as phishing and spam</li>
      </ul>
      <h2>Sharing</h2>
      <p>
        We do not sell your data. We share it only with service providers needed to run {B.brand} (hosting, Razorpay for
        payments, Google Safe Browsing for link safety checks) or when required by law.
      </p>
      <h2>Storage and retention</h2>
      <p>
        Data is stored on servers in India. Detailed click records are deleted automatically after 12 months. To delete
        your account, email {B.email}; your account, links and analytics are deleted within 30 days.
      </p>
      <h2>Your rights</h2>
      <p>You can access, correct, or delete your data by emailing {B.email}.</p>
      <h2>Cookies</h2>
      <p>We use one essential cookie to keep you logged in. We do not use advertising cookies.</p>
      <h2>Grievance officer</h2>
      <p>
        {B.grievanceOfficer.name}, {B.grievanceOfficer.designation} · {B.grievanceOfficer.email} ·{" "}
        {B.grievanceOfficer.phone}
      </p>
    </PolicyLayout>
  );
}

export function Refund() {
  return (
    <PolicyLayout title="Refund and Cancellation Policy">
      <h2>Cancellation</h2>
      <ul>
        <li>You can cancel your subscription anytime from the Billing page.</li>
        <li>After cancelling, auto-renewal stops and you keep paid features until the end of the current billing period.</li>
        <li>No further charges are made after cancellation.</li>
      </ul>
      <h2>Refunds</h2>
      <ul>
        <li>
          If you are charged and are not satisfied, email {B.email} within 7 days of the charge for a full refund of that
          month's payment.
        </li>
        <li>After 7 days, payments are non-refundable, but you can cancel to stop future charges.</li>
        <li>If you were charged twice or incorrectly, we refund the extra amount in full.</li>
        <li>No refunds for accounts suspended for breaking our Terms (for example, phishing or spam).</li>
      </ul>
      <h2>Refund timeline</h2>
      <p>
        Approved refunds are processed within 2 business days and credited to the original payment method within 5–7
        business days, depending on your bank.
      </p>
      <h2>Contact</h2>
      <p>{B.email} · {B.phone}</p>
    </PolicyLayout>
  );
}

export function Contact() {
  return (
    <PolicyLayout title="Contact Us">
      <p>We're happy to help with billing, account or technical questions.</p>
      <ul>
        <li><strong>Business name:</strong> {B.legalName}</li>
        <li><strong>Email:</strong> {B.email}</li>
        <li><strong>Phone:</strong> {B.phone}</li>
        <li><strong>Support hours:</strong> {B.supportHours}</li>
        <li><strong>Address:</strong> {B.address}</li>
      </ul>
      <h2>Grievance Officer</h2>
      <ul>
        <li><strong>Name:</strong> {B.grievanceOfficer.name}</li>
        <li><strong>Designation:</strong> {B.grievanceOfficer.designation}</li>
        <li><strong>Email:</strong> {B.grievanceOfficer.email}</li>
        <li><strong>Phone:</strong> {B.grievanceOfficer.phone}</li>
      </ul>
      <p>We acknowledge complaints within 48 hours and resolve them within 30 days.</p>
    </PolicyLayout>
  );
}
