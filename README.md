# Pulse 💗

Gamified habit tracker. Mobile-first PWA, pastel design, push reminders, XP + badges + leaderboard.

> _Demo GIF placeholder — à ajouter quand la version 1.0 sera figée._

---

## Stack

| Layer       | Tech                                                  |
| ----------- | ----------------------------------------------------- |
| Frontend    | Vite, React 18, TypeScript, TailwindCSS v4, Zustand, React Query, React Hook Form + Zod, @dnd-kit, Recharts |
| PWA / Push  | vite-plugin-pwa (injectManifest), Workbox, Web Push API |
| Backend     | Node.js, Express, TypeScript, Prisma, JWT, bcrypt, zod |
| Scheduling  | node-cron (Europe/Paris)                              |
| Database    | PostgreSQL 14+                                        |

---

## Project layout

```
pulse/
├── backend/         Express + Prisma API + cron + web-push
└── frontend/        Vite + React PWA
```

---

## 1. Backend — local setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill `.env` — see the table below. Then:

```bash
npx web-push generate-vapid-keys      # paste output into VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY
npx prisma migrate dev --name init    # creates DB schema
npx prisma db seed                    # seeds the 12 badges
npm run dev
```

Backend runs on `http://localhost:3001`.

### Backend env vars

| Variable             | Required | Description                                                  |
| -------------------- | -------- | ------------------------------------------------------------ |
| `DATABASE_URL`       | yes      | Postgres connection string                                   |
| `JWT_SECRET`         | yes      | Signs access tokens (15 min TTL)                             |
| `JWT_REFRESH_SECRET` | yes      | Signs refresh tokens (7 day TTL, also stored in DB)          |
| `PORT`               | no       | HTTP port (default `3001`)                                   |
| `FRONTEND_ORIGIN`    | no       | CORS allowlist origin (default `http://localhost:5173`)      |
| `VAPID_PUBLIC_KEY`   | for push | Generated with `npx web-push generate-vapid-keys`            |
| `VAPID_PRIVATE_KEY`  | for push | Generated with `npx web-push generate-vapid-keys`            |
| `VAPID_EMAIL`        | for push | Contact, e.g. `mailto:hello@pulse.app`                       |
| `NODE_ENV`           | no       | Disables cron in `test`                                      |

### Backend routes (auth via `Authorization: Bearer <access>` unless noted)

| Method | Path                                | Auth | Notes                                  |
| ------ | ----------------------------------- | ---- | -------------------------------------- |
| POST   | `/api/auth/register`                | no   | `{ username, email, password }`        |
| POST   | `/api/auth/login`                   | no   | `{ email, password }`                  |
| POST   | `/api/auth/refresh`                 | no   | `{ refresh_token }`                    |
| POST   | `/api/auth/logout`                  | no   | Revokes refresh token                  |
| GET    | `/api/me`                           | yes  | Current user                           |
| GET/POST/PATCH/DELETE | `/api/habits[/:id]`    | yes  | CRUD + reorder via `order`             |
| POST   | `/api/habits/:id/checkin`           | yes  | +10 XP, streak recalc, returns `new_badges`, `leveled_up` |
| DELETE | `/api/habits/:id/checkin`           | yes  | Undo today                             |
| GET/POST/PATCH | `/api/journal*`             | yes  | Daily upsert + history                 |
| GET/POST/`/stats` | `/api/mood*`             | yes  | Mood logs + 7d/30d averages            |
| GET/POST/PATCH/DELETE | `/api/routines[/:id]`  | yes  | CRUD                                   |
| GET    | `/api/stats`                        | yes  | Dashboard aggregates                   |
| GET    | `/api/badges`                       | yes  | All badges + progress + earned status  |
| GET    | `/api/badges/new`                   | yes  | Unseen earned badges, marks seen       |
| GET    | `/api/leaderboard`                  | yes  | Top 10 by XP                           |
| GET    | `/api/notifications/vapid-key`      | no   | Public VAPID key for SW subscription   |
| POST   | `/api/notifications/subscribe`      | yes  | Body `{ endpoint, keys }`              |
| DELETE | `/api/notifications/unsubscribe`    | yes  | Body `{ endpoint? }` (all if omitted)  |
| POST   | `/api/notifications/test`           | yes  | Sends a test push                      |
| GET    | `/health`                           | no   | `{ ok: true }`                         |

### Scheduled jobs

- **Reminder cron** — every day at **20:00 Europe/Paris**. For each user with at least one habit created in the last 7 days whose completion rate today is `< 100%`, sends a push notification. Starts automatically (skipped when `NODE_ENV=test`).

---

## 2. Frontend — local setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend on `http://localhost:5173`.

### Frontend env vars

| Variable        | Required | Description                       |
| --------------- | -------- | --------------------------------- |
| `VITE_API_URL`  | yes      | Backend origin (e.g. `http://localhost:3001`) |

The PWA service worker (`src/sw.ts`) is bundled via `vite-plugin-pwa` in `injectManifest` mode. It handles:

- precaching of built assets
- `NetworkFirst` for `/api/*` (5s timeout, 1h TTL)
- `CacheFirst` for static fonts/images/scripts (30d TTL)
- `push` event → `showNotification`
- `notificationclick` → focuses or opens the URL in the payload

PWA is **disabled in dev** (`devOptions.enabled: false`) to keep iteration fast. To test the SW locally: `npm run build && npm run preview`.

---

## Auth flow

1. `register` / `login` → `{ user, access_token (15m), refresh_token (7d) }`. Both tokens persisted in `localStorage` via Zustand.
2. Axios request interceptor attaches `Authorization: Bearer <access>`.
3. On HTTP `403`, response interceptor calls `/api/auth/refresh` once, retries the original request. If refresh fails → logout + redirect `/login`.

---

## Gamification

- **XP** — +10 per habit check-in. Level formula: `floor(sqrt(xp / 100)) + 1`.
- **Gems** — +1 every 7-day streak multiple.
- **Badges** — 12 seeded badges (first_checkin, streak_3/7/30/100, total_10/50/100, level_5/10, mood_7, journal_7). Awarded inside the same DB transaction as the action that triggered them. Front fetches `/api/badges/new` on load to flush unseen rewards into the modal queue.
- **Leaderboard** — top 10 by XP across all users.

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
vercel deploy
```

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Env vars: set `VITE_API_URL` to your Railway backend URL.
- Vercel serves the manifest + SW automatically because `vite-plugin-pwa` emits them in `dist/`.

### Backend → Railway

1. Create a new Railway project, add a **PostgreSQL** plugin (Railway exposes `DATABASE_URL`).
2. Connect this repo, set the service root to `backend/`.
3. Add env vars: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`, `FRONTEND_ORIGIN=https://<your-vercel-url>`.
4. Set the build command:
   ```
   npm install && npx prisma generate && npm run build
   ```
5. Set the start command:
   ```
   npx prisma migrate deploy && npx prisma db seed && node dist/index.js
   ```
6. Railway auto-injects `PORT`; the server reads it.

Once deployed, point `VITE_API_URL` (Vercel) at the Railway service URL and redeploy the frontend.

### Generating VAPID keys (one-time)

```bash
npx web-push generate-vapid-keys
```

Paste both keys into the backend env. Public key is exposed via `/api/notifications/vapid-key`; the frontend uses it to call `pushManager.subscribe`.

---

## Project structure (selected)

```
backend/src/
├── index.ts                      Express bootstrap + cron start
├── lib/                          prisma, jwt, dates, streak, level, webpush
├── middleware/authenticateToken
├── schemas/                      zod schemas per resource
├── services/                     badgeService, notificationService
├── jobs/reminderJob              node-cron 20h00
└── routes/                       auth, me, habits, journal, mood, routines, stats, badges, leaderboard, notifications

frontend/src/
├── main.tsx                      QueryClient + ToastProvider
├── App.tsx                       BrowserRouter + AppLayout shell
├── sw.ts                         Service worker (injectManifest)
├── api/                          axios instance + per-resource calls
├── components/                   AppLayout, Header, BottomNav, ProfileMenu, HabitCard, XPBar, GemCounter, CheckInAnimation, BadgeUnlockModal, LevelUpModal, RewardOverlay, OnboardingFlow, Toast
├── pages/                        Login, Register, Dashboard, Habits, Journal, Mood, Badges, Leaderboard, Settings
├── store/                        authStore, rewardQueue
├── lib/                          level, rarity, push
└── types/                        user, habit, journal, mood, stats, badge, leaderboard
```

---

## Roadmap (post-MVP)

- Real raster icons (replace SVG placeholders with proper 192/512 PNGs)
- Real-time leaderboard via SSE
- Friend graph + private leaderboards
- Routines runner with countdown
- Theme switcher (pastel ⇄ neon-dark)
