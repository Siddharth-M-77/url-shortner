# Linkzy – URL shortener + QR + link-in-bio SaaS

MERN stack, ES modules (`import`) everywhere.

- **Backend:** Express 5, MongoDB (Mongoose), Redis (ioredis), BullMQ, Zod, JWT (httpOnly cookie)
- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router 7, Recharts

## Features

- Short links with auto-generated or custom alias, expiry, pause/resume, edit destination
- 302 redirects with Redis cache-aside + negative caching
- Click analytics via BullMQ queue + separate worker (source, device, browser, country, daily chart)
- QR code download (PNG/SVG) for every link
- Link-in-bio page at `/u/<username>` with WhatsApp button, Instagram, 4 themes, live preview
- Plans (Free / Starter ₹99 / Pro ₹299) with monthly quotas enforced in Redis
- Abuse protection: Google Safe Browsing check, rate limits, public report form, admin block/ban
- Admin panel: stats, abuse reports, set user plans manually
- Razorpay subscriptions: monthly auto-debit (UPI Autopay / card / netbanking), webhooks, cancel at period end, payment history
- Terms, Privacy, Refund & Cancellation, Contact pages (needed for Razorpay approval)

## Project structure

```
linkzy/
  backend/
    src/
      config/        env, db, redis, plans
      models/        User, Link, Click, BioPage, Report
      middlewares/   auth, validate, quota, rateLimiters, errorHandler
      services/      linkService (create/resolve/cache), analyticsService (aggregations)
      controllers/   auth, link, redirect, bio, report, admin
      queues/        clickQueue (BullMQ producer)
      workers/       clickWorker (BullMQ consumer, separate process)
      routes/        index.js (all /api routes)
      app.js         express app
      server.js      boot + graceful shutdown
  frontend/
    src/
      api/ context/ components/ pages/
  ecosystem.config.cjs   PM2 (API cluster + worker)
  deploy/nginx.conf      Nginx single-domain config
```

## Run locally

Requirements: Node 20+, MongoDB, Redis.

```bash
# 1. Backend
cd backend
cp .env.example .env        # edit values
npm install
npm run dev                 # API on :5000
npm run dev:worker          # in a second terminal: click analytics worker

# 2. Frontend
cd ../frontend
npm install
npm run dev                 # app on :5173 (proxies /api to :5000)
```

To make yourself admin, set `ADMIN_EMAIL=you@example.com` in `backend/.env` **before** registering with that email.

Local short links look like `http://localhost:5000/Ab3xK9q`.

## Razorpay setup

1. Sign up at razorpay.com, switch to **Test Mode**, copy the Key ID and Key Secret into `backend/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxx
   RAZORPAY_KEY_SECRET=xxx
   ```
2. Create the plans on Razorpay (once per mode, test and live):
   ```bash
   cd backend && npm run razorpay:plans
   ```
   Paste the two printed `RAZORPAY_PLAN_...` lines into `.env`.
3. Create a webhook: Dashboard → Account & Settings → Webhooks → Add New
   - URL: `https://lnk.yourdomain.in/api/billing/webhook`
   - Secret: any strong random string, same value in `RAZORPAY_WEBHOOK_SECRET`
   - Events: `subscription.authenticated`, `subscription.activated`, `subscription.charged`,
     `subscription.pending`, `subscription.halted`, `subscription.cancelled`, `subscription.completed`,
     `subscription.paused`, `subscription.resumed`, `payment.failed`
4. Local webhook testing: Razorpay cannot reach `localhost`. Use a tunnel (`npx localtunnel --port 5000` or ngrok)
   and put that URL in the webhook settings. Without webhooks, the `/verify` call after checkout still activates
   the plan, but renewals and cancellations need webhooks.
5. Fill your real details in `frontend/src/config/business.js` (legal name must match PAN/bank).
   Review the policy texts in `frontend/src/pages/Policies.jsx`.
6. Test with Razorpay's test cards/UPI, then complete KYC, switch to live keys, run step 2 and 3 again in live mode.

### How billing works

```
Upgrade click → POST /api/billing/subscribe → Razorpay subscription created
→ Razorpay Checkout (user sets up autopay + pays first month)
→ POST /api/billing/verify (HMAC check + fetch real status from Razorpay) → plan applied
→ Every month: webhook subscription.charged → planExpiresAt extended
→ Cancel: auto-renewal stops, access stays until period end (+1 day grace)
→ Failed debits: subscription.pending → subscription.halted → plan lapses to Free at expiry
```

- Webhooks are verified with HMAC on the raw body and de-duplicated by event id (`WebhookEvent` collection).
- Payments are stored once per `razorpayPaymentId` (unique index), so retries never double-record.
- Switching plan starts the new plan immediately and cancels the old subscription (no proration yet).

## Deploy on a VPS (Nginx + PM2)

```bash
# On the server
git clone <your-repo> /var/www/linkzy
cd /var/www/linkzy/backend && npm ci --omit=dev && cp .env.example .env   # set production values
cd ../frontend && npm ci && npm run build

cd .. && pm2 start ecosystem.config.cjs --env production && pm2 save

sudo cp deploy/nginx.conf /etc/nginx/sites-available/linkzy   # change server_name
sudo ln -s /etc/nginx/sites-available/linkzy /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d lnk.yourdomain.in
```

Production `.env` for a single domain:

```
NODE_ENV=production
BASE_URL=https://lnk.yourdomain.in
CLIENT_URL=https://lnk.yourdomain.in
```

Redis: turn on AOF persistence (`appendonly yes` in `redis.conf`). The link ID counter lives in Redis; the MongoDB unique index on `shortCode` is the safety net if it is ever lost.

Country analytics: put Cloudflare in front (it sends `CF-IPCountry`), otherwise country shows as "unknown".

## API

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/register | – | Create account |
| POST | /api/auth/login | – | Log in (sets cookie) |
| POST | /api/auth/logout | – | Log out |
| GET | /api/auth/me | user | User + plan + usage |
| GET | /api/plans | – | Public plan list |
| GET | /api/links | user | List (page, limit, search) |
| POST | /api/links | user | Create link |
| GET/PATCH/DELETE | /api/links/:id | user | Read / update / delete |
| GET | /api/links/:id/stats?days=30 | user | Analytics |
| GET | /api/links/:id/qr?format=png\|svg | user | QR code |
| GET | /api/links/overview | user | Dashboard totals + 30-day chart |
| GET/PUT | /api/bio/me | user | Own bio page |
| GET | /api/bio/public/:username | – | Public bio page |
| POST | /api/reports | – | Report abusive link |
| GET | /api/admin/stats, /reports, /users | admin | Admin |
| POST | /api/admin/reports/:id/resolve | admin | block / ban / dismiss |
| PATCH | /api/admin/users/:id/plan | admin | Set plan manually |
| GET | /api/billing | user | Current plan, subscription, payments |
| POST | /api/billing/subscribe | user | Create Razorpay subscription |
| POST | /api/billing/verify | user | Verify checkout signature |
| POST | /api/billing/cancel | user | Cancel at period end |
| POST | /api/billing/webhook | Razorpay signature | Razorpay webhook |
| GET | /:code | – | Redirect |

## Not done yet

- **Email verification + password reset** (needs an email provider like Resend or SES).
- **Billing emails / GST invoices.** Razorpay emails a receipt for each charge; proper GST invoices are needed once you register for GST.
- **Proration** when switching plans mid-cycle.
- **Rate-limit store in Redis** (`rate-limit-redis`). The current in-memory store counts per PM2 instance, so real limits are `limit × instances`.
- **Tests.**
- Custom domains per user (Pro feature idea).
