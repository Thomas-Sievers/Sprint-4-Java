# Nous Sight — Front-end

Web interface for the Nous Sight API (Sprint 4). It shows the API working:
meetings, transcript analysis, alerts, the human validation queue, the
dashboard and the registrations (CRUD).

It started from a teammate's front-end written for a different back-end:
only its visual identity (styles, theme, shell and small components) was
kept, and every screen was rewritten for this API.

## Stack

React 19, Vite 8, TypeScript, Tailwind CSS 4, React Router 7, Recharts and
Phosphor Icons. Lint with oxlint.

## Requirements

- Node.js ≥ 20.19 (or ≥ 22.12)
- The Nous Sight API running on `http://localhost:8080` (see the
  [root README](../README.md))

## Running

1. Start the API first, from the repository root:

   ```bash
   ./mvnw spring-boot:run
   ```

2. Then the front-end, in this folder:

   ```bash
   cp .env.example .env   # VITE_API_BASE_URL=http://localhost:8080
   npm install
   npm run dev            # http://localhost:5500
   ```

3. Open http://localhost:5500 and log in with **`aluno` / `123456`**.

The API uses an in-memory H2 database with sample data (10 meetings,
19 alerts, 5 of them pending). Restarting the API resets it.

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

## Demo walkthrough

1. **Login** with `aluno` / `123456` (a wrong password shows "Usuário ou
   senha inválidos").
2. **Dashboard**: 10 meetings, 5 pending alerts, "Revisao de Metas
   Comerciais" in "Reuniões em atenção" (High churn).
3. **Nova Reunião**: title and times → pick participants (one Organizador)
   → **Preencher exemplo** → **Enviar e analisar**. Result: 7 alerts,
   4 pending, churn risk **Alto**.
4. **Validação**: confirm one alert and correct another; each card leaves
   the queue.
5. **Cadastros**: create, edit and delete a department; try the acronym
   `VEND` (422 "Acronym already in use") or delete "Vendas" (422 "has
   participants").

## Error handling

| API status | What the user sees |
|---|---|
| 400 | Message under each invalid field (`fields` of the error body) |
| 401 | Login: "Usuário ou senha inválidos"; elsewhere: logout and back to `/login` |
| 404 | "Reunião não encontrada" on the detail page; banner in forms |
| 422 | The API `message` in a banner (forms) or on the alert card |
| No connection | "Falha de conexão com a API…" with a retry button |

The 422/404 messages come from the API in English.

## Screenshots

Screenshots of every screen (dark and light theme) are in
[`../Docs/screenshots/`](../Docs/screenshots/), for the delivery PDF.

| File | Screen |
|---|---|
| `01-login.png`, `01b-login-erro.png` | Login, wrong password |
| `02-dashboard.png`, `09-dashboard-claro.png` | Dashboard (dark, light) |
| `03-reunioes.png` | Meetings list |
| `04-reuniao-detalhe.png`, `10-reuniao-detalhe-claro.png` | Meeting detail (dark, light) |
| `05a`–`05e-nova-reuniao-*.png` | New meeting: form, participants, transcript, result, detail |
| `06a-validacao.png`, `06b-validacao-corrigir.png` | Validation queue, correcting an alert |
| `07a`–`07d-cadastros-*.png` | CRUD: 422 banner, delete confirmation, participants, dictionary terms |
| `08-configuracoes.png` | Settings |

## Structure

```
src/
├── components/   Shell, layout and UI components (AlertCard, CrudSection, Charts, ChurnBadge, TermTag, Form, States, ...)
├── context/      AuthContext + useAuth (Basic auth session and theme)
├── lib/          api.ts (one function per endpoint), labels.ts (enum labels), format.ts, churn.ts, dashboard.ts (aggregations), ui.ts (form classes), theme
├── pages/        One file per screen
└── types/        api.ts — the API's entities, requests and error body
```
