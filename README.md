# theCliniQProviderWeb

The CliniQ **Provider** web application — the operations workspace for **clinic teams**
and **doctors** on the CliniQ platform. Clinics and doctors use it to manage their
services, availability, appointments, and professional profiles.

The app is a [Next.js](https://nextjs.org) App Router project (Next 16, React 19,
TypeScript) that runs on port **3002**.

> Platform administrators use `theCliniQAdminWeb` instead; this app redirects
> unauthenticated visitors to `/sign-in`.

## Audience & workspaces

The app detects the signed-in user's context via `GET /v1/provider/context` and renders
one of two workspaces:

**Clinic workspace** (when a clinic membership is present)
- Dashboard (`/dashboard`) with setup progress and key metrics.
- Services (`/clinic/services`) — create/edit services, versions, pricing, and exposures.
- Doctors & Staff (`/clinic/doctors`) — connect doctors and manage network connections (request / accept / reject / revoke).
- Appointments (`/clinic/appointments`) — view booked appointments.
- Availability (`/clinic/availability`) — configure per-service availability schedules.
- Clinic Settings (`/clinic/profile`) — edit clinic name and legal name.

**Doctor workspace** (when a doctor profile is present)
- Dashboard (`/dashboard`).
- My Services (`/doctor/services`) — doctor-owned services, versions, exposures.
- Appointments (`/doctor/appointments`).
- Availability (`/doctor/availability`) — configure availability schedules.
- Profile (`/doctor/profile`) — professional verification and evidence upload.
- Account security (`/doctor/security`) — link email/password sign-in to the account.

Additional route: `/accept-invitation` for invited clinics/doctors.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19, CSS (`app/styles.css`, `provider-workspace.css`, `provider-polish.css`) |
| Language | TypeScript 5.9 |
| Auth | Firebase Auth (Google / email + password) + Provider API session (cookie) |
| Lint | ESLint 9 (`eslint-config-next`) |

## Getting started

### Prerequisites

- Node.js 24 (or a current LTS release)
- A running instance of the CliniQ Platform API (see `CliniQPlatform`)

### Install

```powershell
pnpm install
```

### Configure environment

Copy `.env.example` to `.env.local` and provide values for:

- `NEXT_PUBLIC_PLATFORM_API_BASE_URL` — base URL of the CliniQ Platform API.
- `NEXT_PUBLIC_FIREBASE_*` — Firebase web config.

Do not commit `.env.local`.

> Note: a base URL of `http://127.0.0.1*` is normalized to a same-origin (relative) base in
> `src/provider-app.tsx` for local development.

### Run

```powershell
pnpm dev      # http://localhost:3002
pnpm build
pnpm lint
pnpm typecheck
```

### Test helper modules

Some pure helpers include node test files (run directly with Node's test runner):

```powershell
node --test src/provider-formats.test.mts
node --test src/provider-service-readiness.test.mts
```

## Project structure

```
app/                        Next.js App Router routes
  layout.tsx               Root layout (styles)
  page.tsx                 Redirects to /sign-in
  sign-in/                 Provider sign-in (Google + email/password)
  accept-invitation/       Invitation acceptance
  dashboard/               Shared dashboard
  clinic/                  Clinic workspace pages (services, doctors, appointments, availability, profile)
  doctor/                  Doctor workspace pages (services, appointments, availability, profile, security)
src/
  provider-app.tsx         App shell, API client, and page components
  firebase.ts              Firebase app/auth initialization
  provider-formats.ts      Formatting helpers (+ tests)
  provider-service-readiness.ts  Service readiness checks (+ tests)
  provider-humanized-forms.tsx   Human-friendly form components
  provider-icon.tsx        Icon set
```

## API integration

The typed API client lives in `src/provider-app.tsx` (`api<T>()`). It targets the Platform
API base URL with `credentials: "include"`. Errors are thrown as `ProviderApiError`
(status + message) with friendly fallbacks for 401/403/404.

Auth flow:
1. Sign in via Firebase (Google popup or email/password).
2. Exchange the Firebase ID token at `POST /v1/auth/provider/firebase/session`.
3. The Provider API sets the session cookie used by subsequent requests.

## Related projects

- `CliniQPlatform` — API, database, and shared packages.
- `theCliniQAdminWeb` — platform administrator console.
- `theCliniQPatientWeb` — public patient-facing site.
