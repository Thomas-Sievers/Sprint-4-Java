# Nous Sight

Conversational Intelligence platform for TOTVS. Nous Sight turns
sales-meeting transcripts into structured, governed insights. Every
dictionary term detected in a transcript becomes an **alert with a
confidence score**. Alerts **below 80%** go to a **human validation** queue
before they are trusted, so the AI is never a "black box". The platform also
measures the **churn risk** of each meeting from how often competitors are
mentioned.

## Business problem

Ricardo, a Sales Manager, loses roughly 20% of his pipeline because he has no
visibility into what is said in sales meetings. Competitor mentions, product
interest and technology concerns go unnoticed until it is too late. Nous
Sight scans each transcript for the terms in a curated dictionary
(competitors, own products, technology), raises alerts with a confidence
score, sends the uncertain ones to a person for review and flags the
meetings where the client is talking about competitors.

## Features

- Full CRUD for the 7 tables of the database: departments, participants,
  meetings, meeting participants, dictionary terms, transcript lines and
  alerts.
- **Transcript upload and analysis** (`POST /api/meetings/{id}/transcript`):
  saves the lines and detects dictionary terms as whole words, ignoring case
  and accents.
- **Human validation queue** (`GET /api/alerts/pending`) and review
  (`POST /api/alerts/{id}/validate`).
- **Meeting summary** and **churn risk** per meeting.
- Swagger UI, HTTP Basic login and CORS for the front-end.
- React front-end in [`frontend/`](frontend/README.md) that uses this API.

## Architecture

Spring Boot 3.3.4 (Java 21) + Spring Data JPA + Bean Validation + Spring
Security + springdoc-openapi + Lombok, in the
`entity → repository → service → controller` pattern:

```
src/main/java/br/com/fiap/nous_sight/
├── entity/       JPA entities mapped to the Oracle tables (+ MeetingParticipantId composite key)
├── domain/       Enums (ValidationStatus, TermCategory, ParticipationType) and their JPA converters
├── repository/   Spring Data JpaRepository interfaces with derived finders
├── service/      Business rules and transactions
├── controller/   REST controllers under /api
├── dto/          Request records (with Bean Validation) and result records
├── exception/    ResourceNotFoundException, BusinessException, ApiExceptionHandler
└── config/       OpenApiConfig, SecurityConfig, CorsConfig
```

**Database.** The schema comes from [`Docs/sql/sprint4.sql`](Docs/sql/sprint4.sql).
Table and column names, and the stored values (`'Pendente'`, `'Time Rival'`,
`'Organizador'`, ...), stay in **Portuguese**, as in the real Oracle schema.
Everything in Java and in the API is in **English**: each `@Column` points at
the Portuguese physical name, and the converters in `domain/` translate the
enums (`PENDING` ↔ `'Pendente'`, `COMPETITOR` ↔ `'Time Rival'`, ...). IDs come
from the `SEQ_<TABLE>` sequences.

## Running locally (H2, default profile)

```bash
./mvnw spring-boot:run
```

- In-memory H2 database in Oracle mode (`jdbc:h2:mem:noussight;MODE=Oracle`).
  Hibernate creates the tables and sequences from the entities, then
  `src/main/resources/data.sql` loads the sample data. That file is Part 2
  (DML) of `sprint4.sql`: 5 departments, 10 participants, 10 meetings,
  15 meeting links, 10 terms, 18 transcript lines and 19 alerts.
- H2 console: http://localhost:8080/h2-console (JDBC URL
  `jdbc:h2:mem:noussight`, user `sa`, empty password).

Run the tests:

```bash
./mvnw test
```

> Use `./mvnw` instead of a system `mvn` that runs on a JDK newer than 21:
> Mockito can't mock classes on JDK 26.

## Front-end

The web interface is in [`frontend/`](frontend/README.md) (React 19 + Vite +
TypeScript + Tailwind). It runs on `http://localhost:5500`, the origin the
API's CORS allows. Start the API first, then:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

See [`frontend/README.md`](frontend/README.md) for details and
[`Docs/FRONTEND_IMPLEMENTATION_PLAN.md`](Docs/FRONTEND_IMPLEMENTATION_PLAN.md)
for the implementation plan.

## Running against Oracle (delivery)

1. Run `Docs/sql/sprint4.sql` on the Oracle schema (it creates the tables and
   sequences and loads the sample data).
2. Set the username and password in
   `src/main/resources/application-oracle.properties` (they are `RM` /
   `Senha` placeholders now).
3. Start with the `oracle` profile:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=oracle
```

This profile uses `ddl-auto=none` and `sql.init.mode=never`, so Hibernate
never creates or alters the delivered tables and `data.sql` is not run.

## API documentation and login

- Swagger UI: http://localhost:8080/swagger-ui.html (click **Authorize**)
- OpenAPI JSON: http://localhost:8080/v3/api-docs
- Full endpoint table (URI, verb, status codes): [`Docs/ENDPOINTS.md`](Docs/ENDPOINTS.md)
- Class diagram: [`Docs/CLASS_DIAGRAM.md`](Docs/CLASS_DIAGRAM.md)

Every `/api/**` endpoint needs HTTP Basic login:

| User | Password | Roles |
|---|---|---|
| `aluno` | `123456` | USER |
| `admin` | `admin123` | USER, ADMIN |

CORS allows the front-end at `http://localhost:5500` and
`http://127.0.0.1:5500`.

**Errors** are returned as JSON by `ApiExceptionHandler`:

| Status | When | Body |
|---|---|---|
| 400 | Invalid request fields (`@Valid`) | `timestamp, status, error, fields` |
| 401 | Missing or wrong login | — |
| 404 | Record (or referenced record) not found | `timestamp, status, error, message` |
| 422 | Business rule violated | `timestamp, status, error, message` |

### Demo flow

1. `POST /api/meetings/9/transcript`
   ```json
   {"lines": [{"participantId": 1, "spokenAt": "2026-09-11T10:55:00",
               "text": "O cliente disse que a SAP e o Salesforce ligaram."}]}
   ```
   → 2 alerts: SAP (score 70, `PENDING`) and Salesforce (score 95, `VALIDATED`).
2. `GET /api/alerts/pending` → the human validation queue.
3. `POST /api/alerts/{id}/validate` with `{"confirmed": true}`, or
   `{"confirmed": false, "correctedNote": "..."}`.
4. `GET /api/meetings/9/summary` and `GET /api/meetings/9/churn-risk` → `High`.

## Business rules

| # | Rule | Class / method |
|---|---|---|
| 4.1 | An alert needs human validation when `confidenceScore < 80` | `AlertService.needsHumanValidation` |
| 4.2 | Only `PENDING` alerts can be reviewed: confirmed → `VALIDATED`; otherwise → `CORRECTED`, and `correctedNote` is required | `AlertService.registerHumanValidation` |
| 4.3 | Average confidence score of a meeting's alerts (0 when there are none) | `AlertService.calculateAverageConfidenceScore` |
| 4.4 | Churn risk from the meeting's `COMPETITOR` alerts: 0–1 Low, 2–3 Medium, 4+ High | `ClientHistoryService.calculateChurnRisk` |
| 4.5 | Meeting summary: transcript lines, alerts, average score, terms by category | `ClientHistoryService.generateMeetingSummary` |
| MVP | Transcript analysis: all lines saved or none; whole-word, case- and accent-insensitive term detection; score 95, or 70 for keywords of up to 3 characters (SAP, CRM, ERP) | `TranscriptAnalysisService.analyze` |
| — | An alert's status is derived from its score on create and never changed by update; one alert per (line, term) | `AlertService.create` / `update` |
| — | Acronym, email and keyword are unique (case-insensitive) | `DepartmentService`, `ParticipantService`, `DictionaryTermService` |
| — | A meeting's end must not be before its start (same as `CK_REUNIAO_HORARIO`) | `MeetingService.create` / `update` |
| — | No duplicate meeting link; at most one `ORGANIZER` per meeting | `MeetingParticipantService.add` |
| — | A transcript line's speaker must be in the meeting, and `spokenAt` must be within the meeting's time range | `TranscriptLineService.create` / `update` |
| — | Records still referenced elsewhere cannot be deleted (department with participants, participant with lines or meetings, meeting with lines or participants, line or term with alerts) | `delete` in each service |

## Team

| Name | RM |
|---|---|
| Áurea Sardinha | 563837 |
| Bernardo Yuji Rodriguez Hanashiro | 565266 |
| Marco Aurélio | 563827 |
| Matheus Vasques | 563309 |
| Thomas Sievers | 563566 |
