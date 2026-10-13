# Front-end Implementation Plan — Nous Sight | Sprint 4

> **For Claude Code.** This front-end (React 19 + Vite 8 + TypeScript +
> Tailwind 4) was written by a teammate for a **different back-end** (JWT
> login, `/reunioes`, `/insights`, Firebase hosting, Google AI agents). The
> goal now is **only to show that our Sprint 4 API works**: keep the visual
> identity, remove everything that depends on the old back-end or on AI
> services, and connect the remaining screens to `Thomas-Sievers/Sprint-4-Java`.
>
> **Approach (decided):** the front-end lives in `frontend/` inside this
> repository. Instead of copying the old project and deleting most of it,
> `frontend/` starts clean with only the old **design layer** (styles, theme,
> shell, small components, config), and each screen is written again against
> our API, using the old pages as a visual reference. The old project is not
> committed, so no Firebase/AI/old-API code ever enters this repo's history.
>
> Work **one phase at a time**, run `npm run build` and `npm run lint` at
> the end of each phase, make one commit per phase and show the result
> before moving on. **Do not change the back-end** — everything here is
> front-end only.

---

## 0. The back-end we are connecting to

- Base URL `http://localhost:8080`, every route under `/api`.
- **HTTP Basic auth** with in-memory users: `aluno` / `123456` and
  `admin` / `admin123`. No register, no JWT. Wrong/missing login → **401**.
- **CORS** only allows `http://localhost:5500` and `http://127.0.0.1:5500` →
  the dev server must run on **port 5500** (Phase 0). Do not touch the
  back-end CORS.
- Errors: `{ timestamp, status, error, message }` (404, 422) or
  `{ timestamp, status, error, fields: { field: msg } }` (400).
- Dates are ISO `LocalDateTime` without time zone (`2026-09-11T10:20:00`).
- Enums arrive in English: `ValidationStatus` `PENDING|VALIDATED|CORRECTED`;
  `TermCategory` `COMPETITOR|OWN_PRODUCT|TECHNOLOGY`; `ParticipationType`
  `ORGANIZER|PRESENTER|LISTENER`; churn risk `"Low"|"Medium"|"High"`.
- Controllers return the **entities** (nested objects), e.g. an alert has
  `transcriptLine.meeting` and `transcriptLine.participant` inside it.

Endpoints used by the front-end (full list in `Docs/ENDPOINTS.md` of the API repo):

| Screen | Calls |
|---|---|
| Login | `GET /api/meetings` with the Basic header (just to check the credentials) |
| Dashboard | `GET /api/meetings`, `GET /api/alerts`, `GET /api/participants`, `GET /api/meetings/{id}/churn-risk` (one per meeting) |
| Meetings | `GET /api/meetings` (+ churn risk per meeting) |
| Meeting detail | `GET /api/meetings/{id}`, `/participants`, `/transcript-lines`, `/alerts`, `/summary`, `/churn-risk`; `POST /api/alerts/{id}/validate` |
| New meeting | `GET /api/participants`, `POST /api/meetings`, `POST /api/meetings/{id}/participants`, `POST /api/meetings/{id}/transcript` |
| Validation queue | `GET /api/alerts/pending`, `POST /api/alerts/{id}/validate` |
| Registrations (CRUD) | `GET/POST/PUT/DELETE /api/departments`, `/api/participants`, `/api/dictionary-terms` |

Sample data already loaded by the API (H2): 10 meetings, 19 alerts (5
pending: 5, 9, 13, 17, 20), meeting 9 = High churn, meetings 5 and 2 =
Medium. Good for screenshots without typing anything.

## 1. Screen map (keep / adapt / remove)

| Current screen / file | Decision |
|---|---|
| `LoginPage` | **Adapt** — username + password, Basic auth |
| `RegisterPage` (`/registro`) | **Remove** (users are in memory on the API) |
| `DashboardPage` | **Adapt** — KPIs and charts computed in the front-end from our endpoints |
| `MeetingsPage` (`/reunioes`) | **Adapt** — list of meetings with churn badge |
| `MeetingDetailPage` | **Adapt** — participants, transcript, alerts with evidence/score, summary, churn |
| `NovaReuniaoPage` | **Rewrite** — one form: meeting → participants → transcript lines → analyze (the MVP flow) |
| `InsightsPage` | **Adapt** — human validation queue (`/api/alerts/pending`) at `/validacao` |
| `ClientesPage` + `ClientDetailPage` | **Replace** by a `CadastrosPage` with 3 tabs: Departamentos, Participantes, Dicionário de termos (CRUD) |
| `ConfiguracoesPage` | **Simplify** — only theme and "leitura facilitada", saved in localStorage (no profile photo, no `/vendedores/me`) |
| `ProximosPassosPage`, `GerarProximosPassosButton` | **Remove** (AI simulations) |
| `NousChatPage`, `NousButton`, `NousChatShared`, `NousMarkdown` | **Remove** (Google AI agent chat) |
| `DesempenhoPage` | **Remove** (AI seller evaluation) |
| `OrigemChip`, reprocess warning, Synd/device/bot code | **Remove** |
| `e2e/`, `playwright.config.ts` | **Remove** (they mock the old API) |
| `.firebaserc`, `firebase.json`, `.env.production` | **Remove** (Firebase hosting + old Cloud Run URL) |

UI texts stay in **Portuguese** (it is the end-user interface); code
identifiers may keep their current names.

---

## Phase 0 — Base project in `frontend/` (design layer only)

1. Copy from the old project only: `index.css`, `lib/theme.ts`,
   `lib/viewTransition.ts`, `lib/usePrefersReducedMotion.ts`, `AppShell`,
   `AuthLayout`, `ProtectedRoute`, `AppBoot`, `Badge`, `StatCard`, `Avatar`
   (initials only, no photo), `BrandLoader`, `FluidBackground`, `public/`
   and the Vite/TypeScript/oxlint config. Nothing marked **Remove** in
   section 1 is copied.
2. `AppShell`: new `NAV_ITEMS` (Dashboard, Reuniões, Nova Reunião,
   Validação, Cadastros + Configurações), no `NousButton`. Routes that are
   not done yet render a `PlaceholderPage`.
3. `package.json`: no `react-markdown`, no `@playwright/test`, no
   `test:e2e` script. Run `npm install` to update the lock file.
4. `vite.config.ts`: `server: { port: 5500, strictPort: true }` (matches
   the API CORS).
5. `.env.example` → `VITE_API_BASE_URL=http://localhost:8080`; create `.env`
   from it (keep `.env` in `.gitignore`).
6. `index.html`: keep the title "NousSight".
7. `npm run build` and `npm run lint` must pass.

**Commit:** `chore: frontend base with the nous sight design layer on port 5500`

## Phase 1 — API layer and Basic auth

1. **`src/types/api.ts`** — replace with the API shapes: `Department`,
   `Participant`, `Meeting`, `MeetingParticipant` (`id: {meetingId,
   participantId}`, `meeting`, `participant`, `participationType`),
   `DictionaryTerm`, `TranscriptLine`, `GeneratedAlert`
   (`confidenceScore`, `validationStatus`, `note`, `term`,
   `transcriptLine`), `MeetingSummary` (`totalTranscriptLines`,
   `totalAlerts`, `averageConfidenceScore`, `termsByCategory`),
   `TranscriptAnalysisResult`, `ChurnRisk` (`{meetingId, churnRisk}`),
   request types and `ApiErrorBody` (`message?`, `fields?`).
2. **`src/lib/api.ts`**:
   - `request()` sends `Authorization: Basic <token>`; error message =
     `body.message`, or the `fields` joined as `"campo: mensagem"`; keep
     `ApiError(status, message)`; 204 → `undefined`;
   - one small function per endpoint of section 0 (e.g. `listMeetings`,
     `getMeetingSummary`, `analyzeTranscript`, `validateAlert(id,
     {confirmed, correctedNote})`, CRUD for departments/participants/terms).
3. **`src/lib/labels.ts`** (replaces `insightLabels.ts`): Portuguese labels
   and badge tones for the enums — `PENDING` Pendente/warning, `VALIDATED`
   Validado/success, `CORRECTED` Corrigido/neutral; `COMPETITOR`
   Concorrente, `OWN_PRODUCT` Produto TOTVS, `TECHNOLOGY` Tecnologia;
   `ORGANIZER` Organizador, `PRESENTER` Apresentador, `LISTENER` Ouvinte;
   churn `Low` Baixo/success, `Medium` Médio/warning, `High` Alto/danger;
   confidence bands `<70` baixa, `70–84` média, `85+` alta.
4. **Auth**: `AuthContext` stores `token = btoa(username + ":" + password)`
   in localStorage plus the username; remove the profile fetch. `LoginPage`
   asks for **usuário** and senha, calls `GET /api/meetings` with the
   header; 200 → save and redirect, 401 → "Usuário ou senha inválidos".
   Remove the "criar conta" link. No `token.ts`: the username is stored in
   the context (no JWT). Any 401 later → `logout()` and go to `/login`.
   Every request also sends `X-Requested-With: XMLHttpRequest`, so Spring
   Security answers 401 without `WWW-Authenticate` and the browser does not
   open its own Basic login dialog.
5. Show a hint on the login page: "Usuário de teste: aluno / 123456".

**Commit:** `feat: api client and basic auth for the sprint 4 api`

## Phase 2 — Meetings list and meeting detail

1. **`MeetingsPage`**: list from `GET /api/meetings`, newest first: title,
   date/time, duration, churn badge (one `churn-risk` call per meeting, in
   parallel). Click → `/reunioes/:id`. Keep the existing skeleton/empty/error
   states.
2. **`MeetingDetailPage`**:
   - header: title, date, duration, churn badge;
   - summary cards from `/summary`: lines, alerts, average score, terms by
     category (tags);
   - participants with role;
   - transcript: lines in time order with speaker and time; highlight the
     lines that generated alerts;
   - alerts ("Insights"): term + category tag, **evidence** (`note`),
     speaker, score with band color, status badge; pending alerts show the
     same "Confirmar / Corrigir" actions as the validation queue. The card
     is built here as `components/AlertCard.tsx` and reused by Phase 4.
   - 404 → existing "não encontrada" state.
3. Shared pieces created in this phase: `lib/format.ts` (dates, duration,
   score), `lib/churn.ts` (churn risk of many meetings in parallel),
   `lib/errors.ts`, `components/States.tsx` (error/empty/skeleton/header),
   `ChurnBadge`, `TermTag` (category chip), `ScoreConfianca`.
   `useAuth` moved to `context/useAuth.ts` so lint has no warnings.

**Commit:** `feat: meetings list and meeting detail on the new api`

## Phase 3 — New meeting (MVP flow)

Rewrite `NovaReuniaoPage` as one page with three steps:
1. **Reunião**: título, início, fim → `POST /api/meetings`.
2. **Participantes**: pick from `GET /api/participants` + papel (one
   Organizador at most) → `POST /api/meetings/{id}/participants` for each.
3. **Transcrição**: rows of `{participante (only the linked ones), horário
   (inside the meeting time), fala}` with "adicionar fala"; a button
   **"Preencher exemplo"** that fills 3–4 lines mentioning SAP, Salesforce
   and Protheus (for the demo) → `POST /api/meetings/{id}/transcript`.
4. Show the result (`TranscriptAnalysisResult`): alerts created, how many
   pending, average score, churn risk, and a button to open the meeting
   detail.

API 422 messages (e.g. speaker not linked, time outside the meeting) are
shown next to the form. Remove all audio/bot/device/Synd code.

Implementation notes: the meeting is created on one date with start/end
times; participants are linked one `POST` at a time (organizer first), so a
422 names who failed and the ones already linked stay locked; the form also
blocks a second Organizador and checks times before sending. The example
fills 4 lines (SAP twice, Salesforce, CRM, Protheus, ERP, Concorrente X) →
7 alerts, 4 pending, churn **High**. Shared form pieces: `lib/ui.ts`
(input/button classes) and `components/Form.tsx` (`Field`, `FormBanner`).

**Commit:** `feat: new meeting flow with transcript analysis`

## Phase 4 — Human validation queue

`InsightsPage` → "Validação":
- list `GET /api/alerts/pending`: meeting title, speaker, time, evidence,
  term + category, score;
- **Confirmar** → `POST /api/alerts/{id}/validate` `{confirmed: true}`;
- **Corrigir** → textarea → `{confirmed: false, correctedNote}` (required);
- the card leaves the list on success (with a short "confirmado /
  corrigido" note); 422 (already reviewed) shows the message on the card.
  The card is `components/AlertCard.tsx` (built in Phase 2, here with
  `showMeeting` to link to the meeting). Oldest mention first.

**Commit:** `feat: human validation queue`

## Phase 5 — Dashboard (computed in the front-end)

No new back-end endpoint: compute everything from `meetings`, `alerts`,
`participants` and the churn risk of each meeting.
- KPIs: reuniões, participantes, alertas pendentes (link to the queue).
- Charts (reuse the existing Recharts components and styles):
  reuniões por risco de churn; alertas por status; faixas de confiança;
  concorrentes mais mencionados (`COMPETITOR` alerts grouped by keyword);
  produtos TOTVS mencionados (`OWN_PRODUCT`); reuniões por semana.
- "Reuniões em atenção": meetings with High risk, linking to the detail.
- Remove the charts with no data source ("tendência de comunicação").

Implementation notes: the aggregations are plain functions in
`lib/dashboard.ts`; the charts are two reusable components in
`components/Charts.tsx` (`HBarChart`, `VBarChart`) with the old styles.
Status colors only appear on status-like categories (churn, validation
status, confidence band), always next to a text label. "Reuniões por semana"
shows up to 8 weeks ending at the latest meeting, with empty weeks included.
The dashboard is lazy-loaded so Recharts is a separate chunk.

**Commit:** `feat: dashboard from api data`

## Phase 6 — Registrations (CRUD) and settings

1. **`CadastrosPage`** (`/cadastros`, nav item "Cadastros") with tabs:
   - Departamentos (nome, sigla);
   - Participantes (nome, e-mail, departamento select);
   - Dicionário de termos (palavra-chave, categoria select).
   Each tab: table + create/edit form + delete with confirmation; API 400
   field errors under the fields, 422 messages (duplicate, "has
   participants", etc.) in a banner. This shows the full CRUD working.
   The three tabs share one generic component, `components/CrudSection.tsx`
   (config per resource: columns, form fields, client checks, API calls);
   the active tab is in the URL (`/cadastros?aba=participantes`).
2. **`ConfiguracoesPage`**: keep only tema (claro/escuro) and leitura
   facilitada, both in localStorage; remove photo upload and the API calls.
   In the old app "leitura facilitada" showed AI-written short summaries,
   which this API does not have; here it enlarges the text (~12%) and the
   line spacing (`html[data-leitura="facilitada"]` in `index.css`), applied
   before the first paint like the theme.

**Commit:** `feat: crud registrations and local settings`

## Phase 7 — Check and document

1. `npm run build` and `npm run lint` clean; no reference left to
   `firebase`, `/reunioes/bot`, `/nous`, `/simulacoes`, `/vendedores`,
   `/dashboard/resumo`, `react-markdown`.
2. Manual test with the API running (`./mvnw spring-boot:run` in the API
   repo) and the front on `http://localhost:5500`: login → dashboard →
   nova reunião with the example → detail → validate a pending alert →
   queue shrinks → CRUD create/edit/delete + one 422.
3. `README.md` (Portuguese or English, ask): what it is, requirements (Node
   ≥ 20.19 or 22.12), `npm install`, `.env`, `npm run dev`, test user,
   and that the API must be running first.
4. Take screenshots of each screen for the Java PDF ("prints das telas
   implementadas").

Result of the final check: no reference left from the list above;
`npm run build` and `npm run lint` clean. The manual path was run in
headless Chrome against the real API (wrong and right login, dashboard,
meetings, detail, 404, new meeting with the example → 7 alerts / 4 pending
/ High, confirm and correct in the queue, department create/edit/delete,
422 duplicate and 422 "has participants", participant e-mail check, light
theme, 401 with a stale token → `/login`) with no console errors. The
screenshots are in `Docs/screenshots/`.

**Commit:** `docs: front-end readme and final check`

## Definition of Done

- [x] No Firebase, Google AI or old-API code left; app runs on port 5500.
- [x] Login with `aluno` / `123456` against the real API.
- [x] Dashboard, meetings, meeting detail, new meeting (analysis), validation queue and CRUD screens all use the Sprint 4 API.
- [x] API errors (400/401/404/422) shown as friendly messages.
- [x] `npm run build` and `npm run lint` pass; screenshots ready for the PDF.

## Decisions

1. The front-end lives in a `frontend/` folder inside `Sprint-4-Java`.
2. The front-end README is in **English**.
3. The validation queue is at `/validacao` (nav item "Validação").
