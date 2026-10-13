# Nous Sight — Front-end

Web interface for the Nous Sight API (Sprint 4). It shows the API working:
meetings, transcript analysis, alerts, the human validation queue, the
dashboard and the registrations (CRUD).

> Work in progress — see
> [`../Docs/FRONTEND_IMPLEMENTATION_PLAN.md`](../Docs/FRONTEND_IMPLEMENTATION_PLAN.md).

## Stack

React 19, Vite 8, TypeScript, Tailwind CSS 4, React Router 7, Recharts and
Phosphor Icons. Lint with oxlint.

## Requirements

- Node.js ≥ 20.19 (or ≥ 22.12)
- The Nous Sight API running on `http://localhost:8080` (see the
  [root README](../README.md))

## Running

```bash
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev            # http://localhost:5500
```

The dev server is fixed on **port 5500** (`strictPort`) because the API's
CORS only allows `http://localhost:5500` and `http://127.0.0.1:5500`.

| Script | What it does |
|---|---|
| `npm run dev` | Dev server on port 5500 |
| `npm run build` | Type-check and production build to `dist/` |
| `npm run lint` | oxlint |
| `npm run preview` | Serve the build on port 5500 |

## Login

The API uses **HTTP Basic** with in-memory users, so there is no sign-up:

| User | Password |
|---|---|
| `aluno` | `123456` |
| `admin` | `admin123` |

The login page checks the credentials with `GET /api/meetings`. On success
the token (`base64(username:password)`) and the username are saved in
`localStorage` and sent as `Authorization: Basic <token>` on every request
(`src/lib/api.ts`). Any later 401 logs out and goes back to `/login`.

## Screens

| Route | Screen | API calls |
|---|---|---|
| `/login` | Login (HTTP Basic) | `GET /api/meetings` |
| `/dashboard` | KPIs and charts computed in the browser: meetings by churn risk, per week, alerts by status and confidence band, top competitors and TOTVS products, high-risk meetings | `GET /api/meetings`, `GET /api/alerts`, `GET /api/participants`, `GET /api/meetings/{id}/churn-risk` per meeting |
| `/reunioes` | Meetings, newest first, with churn badge | `GET /api/meetings`, `GET /api/meetings/{id}/churn-risk` per meeting |
| `/reunioes/nova` | New meeting in 3 steps (meeting → participants → transcript) + analysis result; "Preencher exemplo" fills a demo transcript | `GET /api/participants`, `POST /api/meetings`, `POST /api/meetings/{id}/participants`, `POST /api/meetings/{id}/transcript` |
| `/reunioes/:id` | Meeting detail: summary, participants, transcript (lines with alerts highlighted), alerts with Confirmar / Corrigir | `GET /api/meetings/{id}` + `/participants`, `/transcript-lines`, `/alerts`, `/summary`, `/churn-risk`; `POST /api/alerts/{id}/validate` |
| `/validacao` | Human validation queue: Confirmar → `VALIDATED`, Corrigir + note → `CORRECTED` | `GET /api/alerts/pending`, `POST /api/alerts/{id}/validate` |
| `/cadastros` | CRUD in 3 tabs: Departamentos, Participantes, Dicionário de termos (400 errors under the fields, 422 in a banner) | `GET/POST/PUT/DELETE /api/departments`, `/api/participants`, `/api/dictionary-terms` |
| `/configuracoes` | Theme (dark/light) and "leitura facilitada" (larger text), saved in `localStorage` | — |

## Structure

```
src/
├── components/   Shell, layout and UI components (AlertCard, CrudSection, Charts, ChurnBadge, TermTag, Form, States, ...)
├── context/      AuthContext + useAuth (Basic auth session and theme)
├── lib/          api.ts (one function per endpoint), labels.ts (enum labels), format.ts, churn.ts, dashboard.ts (aggregations), ui.ts (form classes), theme
├── pages/        One file per screen
└── types/        api.ts — the API's entities, requests and error body
```
