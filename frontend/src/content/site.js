// Marketing content shared by the landing page and the SEO structured data
// injected into index.html (see vite.config.js). Edit here and both stay in sync.

// Mirrors backend/src/config/plans.js. Shown when the /plans API can't be reached,
// so the pricing section is never empty. null means unlimited.
export const FALLBACK_PLANS = [
  { key: "free", name: "Free", price: 0, linksPerMonth: 20, trackedClicksPerMonth: 1000, customAlias: false, removeBranding: false },
  { key: "starter", name: "Starter", price: 99, linksPerMonth: null, trackedClicksPerMonth: 50000, customAlias: true, removeBranding: false },
  { key: "pro", name: "Pro", price: 299, linksPerMonth: null, trackedClicksPerMonth: null, customAlias: true, removeBranding: true },
];

// Public, indexable routes: listed in sitemap.xml and prerendered to static HTML at build.
// Private app pages (dashboard, billing...) stay out of both.
export const PUBLIC_ROUTES = ["/", "/register", "/login", "/terms", "/privacy", "/refund", "/contact", "/report"];

// The landing page hero hands a pasted URL to the dashboard's create form through this key
export const PENDING_URL_KEY = "linkzy:pendingUrl";

export const FAQS = [
  {
    q: "What is Linkzy?",
    a: "Linkzy is a free URL shortener made for India. You can shorten long links, make QR codes, track every click and build a link-in-bio page, all from one dashboard.",
  },
  {
    q: "Is the Linkzy URL shortener free?",
    a: "Yes. The Free plan gives you 20 short links and 1,000 tracked clicks every month, plus QR codes and a bio page. No credit card is needed to sign up.",
  },
  {
    q: "Do my short links expire?",
    a: "No, not unless you set an expiry date yourself. You can also pause a link, or change where it points, at any time without changing the short link.",
  },
  {
    q: "Can I create a custom short link?",
    a: "Yes. On the Starter and Pro plans you can choose your own ending, like /diwali-sale, so your links are easy to read and remember.",
  },
  {
    q: "Can I see who clicks my links?",
    a: "Every link has its own analytics page: clicks over time, top traffic sources such as WhatsApp and Instagram, devices, browsers and countries.",
  },
  {
    q: "How do I pay for a paid plan?",
    a: "Paid plans are billed monthly in rupees through Razorpay. You can pay with UPI Autopay, debit or credit cards, or netbanking, and cancel anytime from the Billing page.",
  },
];
