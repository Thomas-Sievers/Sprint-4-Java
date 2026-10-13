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

## Structure

```
src/
├── components/   Shell, layout and small UI components (Badge, StatCard, ...)
├── context/      AuthContext (session and theme)
├── lib/          Theme, view transitions and other helpers
├── pages/        One file per screen
└── types/        TypeScript types
```
