# Pollaris

A poll platform. Creators build and share polls, respondents answer them anonymously or while signed in, and real-time analytics stream back to the dashboard the moment each response lands.

**[Live Demo](https://pollaris.bhavaynagpal.com/)** - Try the fully working app.

## Tech Stack

| Layer    | Technology                                                                       |
| -------- | -------------------------------------------------------------------------------- |
| Frontend | React 19, Vite, Tailwind CSS v4, Zustand, Socket.IO client, `better-auth` client |
| Backend  | Express 5, MongoDB + Mongoose, Socket.IO, Redis (Pub/Sub adapter)                |
| Auth     | Better Auth — email/password + optional Google OAuth                             |
| Email    | Resend (password-reset emails)                                                   |

---

## Features

### Creator (authenticated)

- Build polls with multiple single-choice questions; mark each question required or optional.
- Choose response mode per poll: **anonymous** or **authenticated** (respondents must be signed in).
- Set an expiry date/time — expiry is enforced on the backend at submission time.
- **Publish / unpublish** a poll to open or close the public response link.
- **Publish / unpublish results** independently — results are hidden from respondents until you decide to share them.
- Delete polls (with all associated responses).
- Real-time analytics dashboard: response counts, per-question option breakdowns, and participation insights — all updated via Socket.IO the moment a response arrives.
- Dashboard with search, status filtering (all / active / draft / expired), sort (newest / oldest / most responses), and pagination.

### Respondent (public)

- Visit any shareable `/p/:slug` link without an account (unless the poll requires authentication).
- One response per respondent per poll (duplicate prevention enforced server-side).
- View published results on the same link after the creator releases them.

### Account management

- Update display name.
- Change password (revokes all other active sessions on success).
- Forgot-password / reset-password flow via email (Resend).
- Permanently delete account.

---

## Repository Structure

```
Pollaris/
├── Backend/
│   ├── server.js              # HTTP + Socket.IO bootstrap, graceful shutdown
│   └── src/
│       ├── app.js             # Express app, middleware, rate limiters, error handler
│       └── modules/
│           ├── auth/          # Auth middleware (session → req.user)
│           ├── polls/         # Creator CRUD, analytics, publish lifecycle
│           ├── public/        # Public poll view, response submission, results
│           └── shared/        # Validation, analytics helpers, poll-lock, optional auth
└── Frontend/
    └── src/
        ├── pages/             # Home, Login, Register, ForgotPassword, ResetPassword,
        │                      # Dashboard, PollBuilder, PollAnalytics, PublicPoll,
        │                      # Settings, NotFound
        ├── Components/        # AppShell, Navbar, ProtectedRoute, GuestRoute,
        │                      # ThemeProvider, dashboard cards, shared UI primitives
        ├── hooks/             # usePollActions and other custom hooks
        ├── lib/               # API client, auth-client (better-auth)
        └── store/             # Zustand auth store
```

---

## Backend Setup

### 1. Environment variables

```bash
cp Backend/.env.example Backend/.env
```

Fill in `Backend/.env`:

```env
PORT=3000
MONGODB_URI=<your MongoDB connection string>
REDIS_URL=redis://localhost:6379

# Better Auth
BETTER_AUTH_SECRET=<generate: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173

# Google OAuth (optional — email/password works without these)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email (Resend) — required for password-reset emails
RESEND_API_KEY=
EMAIL_FROM=noreply@yourdomain.com
```

### 2. Install & run

```bash
cd Backend
npm install
npm start        # starts on PORT (default 3000)
```

### Redis

Socket.IO uses a Redis Pub/Sub adapter so analytics events are synchronized across multiple backend instances. Redis is **required** in every environment. Run a local Redis instance or point `REDIS_URL` at a managed service (e.g. Redis Cloud, Upstash).

### Rate limiting

| Scope                       | Limit                 |
| --------------------------- | --------------------- |
| Global (all routes)         | 100 req / IP / 15 min |
| Auth routes (`/api/auth/*`) | 50 req / IP / 15 min  |

Rate-limit responses include `retryAfter` (seconds) and a human-readable `message`.

---

## Frontend Setup

### 1. Environment variables

```bash
cp Frontend/.env.example Frontend/.env
```

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_AUTH_BASE_URL=http://localhost:3000/api/auth
VITE_SOCKET_URL=http://localhost:3000
```

### 2. Install & run

```bash
cd Frontend
npm install
npm run dev      # starts on http://localhost:5173
```

---

## Demo Flow

1. Register or sign in as a creator.
2. Create a poll — add required/optional questions, set an expiry, choose response mode.
3. Publish the poll to generate a shareable `/p/:slug` link.
4. Open the link in another tab (or share it) and submit a response.
5. Watch the analytics page update in real time.
6. Hit **Publish results** — the same public link now shows a summary instead of the form.
7. Visit **Settings** to update your profile, change your password, or delete your account.
