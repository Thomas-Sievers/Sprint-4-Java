# Implementation Plan — Nous Sight | Sprint 4 (Domain Driven Design – Java)

> **For Claude Code.** This repository is a fresh copy of the `main` branch
> of `Thomas-Sievers/Sprint-3-Java`. Take it to the Sprint 4 delivery
> (deadline **2026-10-14**) following this plan. Work **one phase at a
> time**: run `mvn test` at the end of each phase, make one commit per
> phase and show the result before moving on.
>
> **Guiding principle: stay close to what was taught in class.** The
> professor's reference project ("GameStore – gabarito do hands-on de
> Spring Boot") defines the style: `entity → repository → service →
> controller`, request DTOs as `record` + `@Valid`, controllers returning
> entities, two domain exceptions + one `@RestControllerAdvice`,
> `@ResponseStatus` for 201/204, Swagger with `@Tag` + `@Operation`, Spring
> Security with HTTP Basic and in-memory users, CORS for `/api/**`. **Do not
> add patterns beyond that** (no response DTOs/mappers, no extra exception
> types, no Location headers, no extra test frameworks).
>
> **Scope:** back-end only. The front-end comes later, in a separate plan.
>
> **Language:** everything in English (code, API values, messages, Swagger
> text, README), **except** the database table/column names and the domain
> values already stored by `sprint4.sql`, which stay in Portuguese.

---

## 0. What Sprint 4 asks for (Java)

| Criterion | Points | Phase |
|---|---|---|
| Model layer with all classes needed, matching the database | 10 | 1 |
| DAO + Service (validations), fully working CRUD, everything the front-end needs | 20 | 2 |
| RESTful API with every endpoint the front-end needs | 30 | 3, 4 |
| Best practices from class: naming, exception handling, design patterns | 20 | 2, 3, 4 |
| PDF: cover, TOC, objective/scope, features, **endpoint table (URI, verb, status codes)**, screenshots, database model, updated class diagram | 20 | 5 (inputs) |

## 1. The database (source of truth: `sprint4.sql`)

The final `sprint4.sql` (also in the "challange 2 ano" project — ask the
user for it if it is not in the repo) has already been run on Oracle
(schema `RM563566`). The API must **map it, not change it**.

- 7 tables: `DEPARTAMENTO`, `PARTICIPANTE`, `REUNIAO`,
  `REUNIAO_PARTICIPANTE`, `DICIONARIO_TERMOS`, `FALA_TRANSCRICAO`,
  `ALERTA_GERADO`.
- IDs come from **sequences** `SEQ_<TABLE>` (`INCREMENT BY 1`), not IDENTITY.
- `REUNIAO_PARTICIPANTE` has a **composite PK** (`ID_REUNIAO`,
  `ID_PARTICIPANTE`) and no `ID` column.
- `ALERTA_GERADO` has `SCORE_CONFIANCA NUMBER(3)` (CHECK 0–100),
  `STATUS_VALIDACAO VARCHAR2(15)` (CHECK `'Pendente'|'Validado'|'Corrigido'`)
  and a UNIQUE on (`ID_TRANSCRICAO`, `ID_TERMO`).
- Rule already in the data: score < 80 → starts `'Pendente'`; otherwise
  `'Validado'`. Only `'Pendente'` alerts can be reviewed.

**Stored value ↔ English enum exposed by the API** (the Portuguese values
appear only inside the converters):

| Enum | API value → stored value |
|---|---|
| `ValidationStatus` | `PENDING`→`'Pendente'`, `VALIDATED`→`'Validado'`, `CORRECTED`→`'Corrigido'` |
| `TermCategory` | `COMPETITOR`→`'Time Rival'`, `OWN_PRODUCT`→`'Produto Próprio'`, `TECHNOLOGY`→`'Tecnologia'` |
| `ParticipationType` | `ORGANIZER`→`'Organizador'`, `PRESENTER`→`'Apresentador'`, `LISTENER`→`'Ouvinte'` |

**Sample data after the DML** (use it for demos and expected results):
5 departments, 10 participants, 10 meetings, 15 links, 10 terms,
18 transcript lines, 19 alerts (**13 VALIDATED, 5 PENDING — ids 5, 9, 13,
17, 20 — and 1 CORRECTED**). Competitor mentions per meeting: meeting 9 → 4
(High), 5 → 3 (Medium), 2 → 2 (Medium), 1 → 1 (Low), others → 0 (Low).
Meetings 6, 7, 8 and 10 have no transcript lines.

## 2. What is wrong in the Sprint 3 code (fixed in Phase 1)

1. Entities use `IDENTITY`; the database uses sequences → INSERT fails on Oracle.
2. `MeetingParticipant` has a surrogate `id`; the table has a composite PK → fails on Oracle.
3. Column sizes/nullability differ from the DDL (e.g. `TITULO` 100, `SIGLA` 10 and nullable, `PARTICIPANTE.ID_DEPARTAMENTO` nullable).
4. `MeetingService` rejects `end == start`; the database CHECK allows it (`>=`).
5. Churn risk uses `now() - 30 days`; with the fixed sample dates it always returns Low.
6. Every error returns 400; controllers have `try/catch`.
7. `pom.xml` is on Spring Boot 4.1.1 (class uses 3.3.4), declares `spring-boot-h2console` twice, and `.mvn/wrapper` is missing.

---

## Phase 0 — Project setup (align with the class project)

1. **`pom.xml` → same stack as the class reference:**
   - parent `spring-boot-starter-parent` **3.3.4**, Java 21;
   - dependencies: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`,
     `spring-boot-starter-validation`, `spring-boot-starter-security`,
     `org.springdoc:springdoc-openapi-starter-webmvc-ui` **2.6.0**,
     `h2` (runtime), `com.oracle.database.jdbc:ojdbc11` (runtime),
     `lombok` (optional, keep — the Sprint 3 code uses it),
     `spring-boot-starter-test` and `spring-security-test` (test);
   - remove the Boot 4-only artifacts (`spring-boot-starter-webmvc`,
     `spring-boot-h2console`, `*-data-jpa-test`, `*-webmvc-test`, `ojdbc17`);
   - keep the Lombok annotation-processor config in `maven-compiler-plugin`.
2. Regenerate the Maven Wrapper (`mvn wrapper:wrapper`) so `./mvnw` works.
3. Remove `.DS_Store`, add it to `.gitignore`. Fix `CLAUDE.md` (`@Docs/SPEC.md`)
   and point it to this plan.
4. Copy `sprint4.sql` to `Docs/sql/sprint4.sql`.
5. `mvn test` must pass before moving on (fix imports if the downgrade
   breaks anything).

**Commit:** `chore: align project setup with class reference (Spring Boot 3.3.4)`

---

## Phase 1 — Model aligned with the database + local data

1. **Sequence IDs** on the 6 tables with a single PK:
   ```java
   @Id
   @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seqReuniao")
   @SequenceGenerator(name = "seqReuniao", sequenceName = "SEQ_REUNIAO", allocationSize = 1)
   @Column(name = "ID_REUNIAO")
   private Long id;
   ```
   `allocationSize = 1` is mandatory.
2. **Composite key** for `MeetingParticipant`: `@Embeddable MeetingParticipantId`
   (`meetingId` → `ID_REUNIAO`, `participantId` → `ID_PARTICIPANTE`,
   `Serializable`, `equals/hashCode`) + `@EmbeddedId` and `@MapsId` on the
   two `@ManyToOne`.
3. **Sizes and nullability** exactly as in the DDL (`length`, `nullable`,
   `unique`), plus `@UniqueConstraint` (`ID_TRANSCRICAO`, `ID_TERMO`) on
   `ALERTA_GERADO`. "Required" business rules that the DDL does not enforce
   go in the request DTO (`@NotNull`), not in the entity.
4. **Enums + converters** (`domain` package): `ValidationStatus`,
   `TermCategory`, `ParticipationType` as in section 1, each with an
   `AttributeConverter` (`@Converter`) that maps the English constant to the
   stored Portuguese value. Use them in the entities instead of `String`.
5. **H2 = copy of Oracle** (`application.properties`, default profile):
   ```properties
   spring.datasource.url=jdbc:h2:mem:noussight;MODE=Oracle
   spring.jpa.hibernate.ddl-auto=create-drop
   spring.jpa.defer-datasource-initialization=true
   spring.h2.console.enabled=true
   spring.h2.console.path=/h2-console
   springdoc.swagger-ui.path=/swagger-ui.html
   ```
   and `src/main/resources/data.sql` = **Part 2 (DML) of `sprint4.sql`**
   (INSERTs, the 4 UPDATEs and the DELETE; no DDL, no DQL). After startup
   the counts must match section 1.
6. **Oracle profile** (`application-oracle.properties`): same pattern as the
   class (`oracle.fiap.com.br:1521:orcl`, `ojdbc11`), with
   `spring.jpa.hibernate.ddl-auto=none` (the tables already exist) and
   `spring.sql.init.mode=never`. Username/password written in the file as
   in class — **ask the user** for the real values or leave `RM`/`Senha`.

**Commit:** `feat(model): map entities to the sprint4.sql schema and seed H2`

---

## Phase 2 — Repositories, services and business rules

**Exceptions (same as class):** `ResourceNotFoundException` (→ 404) and
`BusinessException` (→ 422), both `RuntimeException`, messages in English.

**Service pattern (same as class):** constructor injection,
`@Transactional(readOnly = true)` on reads and `@Transactional` on writes,
methods `findAll / findById / create / update / delete`, private
`validateXxx` methods, a private `fill(entity, request)`.

**Repositories:** one per entity (7, including
`MeetingParticipantRepository extends JpaRepository<MeetingParticipant, MeetingParticipantId>`),
only the derived finders the rules below need (`existsBy…`, `findBy…`).

**Rules per service** (all violations → `BusinessException`, missing
related record → `ResourceNotFoundException`):

| Service | Rules |
|---|---|
| `DepartmentService` | acronym unique (ignore case); cannot delete a department that has participants |
| `ParticipantService` | email unique (ignore case); department must exist; cannot delete a participant who has transcript lines |
| `MeetingService` | end ≥ start (same as the DB CHECK); cannot delete a meeting that has transcript lines |
| `MeetingParticipantService` | meeting and participant must exist; no duplicate link; at most one `ORGANIZER` per meeting |
| `DictionaryTermService` | keyword unique (ignore case); cannot delete a term that has alerts |
| `TranscriptLineService` | speaker must be linked to the meeting; `spokenAt` within the meeting time range |
| `AlertService` | **4.1** `needsHumanValidation` (score < 80); **4.2** `registerHumanValidation` — only `PENDING` alerts, confirmed → `VALIDATED`, otherwise `CORRECTED` and `correctedNote` is required; **4.3** `calculateAverageConfidenceScore`; on create, status is **derived from the score** (never sent by the client) and (line, term) must be unique; `update` cannot change the status; `findPending()` |
| `TranscriptAnalysisService` (new, MVP) | see below |
| `ClientHistoryService` | **4.4** `calculateChurnRisk(meetingId)` — count the meeting's `COMPETITOR` alerts, **without the 30-day window**: 0–1 Low, 2–3 Medium, 4+ High; **4.5** `generateMeetingSummary(meetingId)` — 404 if the meeting does not exist |

**`TranscriptAnalysisService.analyze(meetingId, request)`** — US01/US02/US03,
the main business method (like `OrderService.criar` in class):
1. receives a list of `{participantId, spokenAt, text}`; validates and saves
   each line with the `TranscriptLineService` rules, all in one
   `@Transactional` (one invalid line → nothing saved);
2. for each line and each dictionary term, checks if the term appears as a
   **whole word**, ignoring case and accents (`java.text.Normalizer` + regex
   `\b…\b`) — "SAP" must not match "sapato";
3. creates one alert per (line, term): `note` = the line text cut to 200
   chars (textual evidence), `confidenceScore` = **95**, or **70** when the
   keyword has 3 characters or fewer (ambiguous acronyms like SAP, CRM,
   ERP), status derived from the score;
4. returns a record with the saved lines, the created alerts, how many are
   `PENDING`, the average score and the churn risk.

**Tests:** keep `AlertServiceTest` and `ClientHistoryServiceTest` passing
(adapt to the enums and the new churn rule). Add, in the same Mockito
style, one test per new rule of `AlertService` and
`TranscriptAnalysisService` ("SAP" ✔ / "sapato" ✘, short keyword → 70 and
`PENDING`, already-reviewed alert → exception).

**Commit:** `feat(service): repositories, business rules and transcript analysis`

---

## Phase 3 — Controllers, request DTOs and error handling

1. **Request DTOs** (`dto` package) as `record`s with Bean Validation, sizes
   from the DDL, relationships by id (e.g. `ParticipantRequest(String name,
   String email, Long departmentId)`; `AlertRequest` has no status field;
   `confidenceScore` with `@Min(0) @Max(100)`). Keep the existing
   `AlertValidationRequest` and `MeetingSummaryDTO` (turn them into records).
2. **Controllers return the entity** (like class), with
   `@ResponseStatus(HttpStatus.CREATED)` on POST and
   `@ResponseStatus(HttpStatus.NO_CONTENT)` on DELETE. **No `try/catch`.**
3. **`ApiExceptionHandler`** (`@RestControllerAdvice`, same as class):
   `ResourceNotFoundException` → 404, `BusinessException` → 422,
   `MethodArgumentNotValidException` → 400 with the field errors. Body:
   `timestamp`, `status`, `error`, `message` (or `fields`).
4. **Endpoints** — all under `/api` (like class). Remove
   `ClientHistoryController` (`/clients/...`); its routes move to `/api/meetings/{id}/...`.

| Resource | Verb + URI | Success | Errors |
|---|---|---|---|
| Departments | `GET /api/departments` · `GET /api/departments/{id}` | 200 | 404 |
| | `POST /api/departments` · `PUT /api/departments/{id}` | 201 · 200 | 400, 404, 422 |
| | `DELETE /api/departments/{id}` | 204 | 404, 422 |
| Participants | `GET /api/participants` · `GET /{id}` · `POST` · `PUT /{id}` · `DELETE /{id}` | 200 · 200 · 201 · 200 · 204 | 400, 404, 422 |
| Meetings | `GET /api/meetings` · `GET /{id}` · `POST` · `PUT /{id}` · `DELETE /{id}` | 200 · 200 · 201 · 200 · 204 | 400, 404, 422 |
| | `GET /api/meetings/{id}/participants` | 200 | 404 |
| | `POST /api/meetings/{id}/participants` `{participantId, participationType}` | 201 | 400, 404, 422 |
| | `DELETE /api/meetings/{id}/participants/{participantId}` | 204 | 404 |
| | `GET /api/meetings/{id}/transcript-lines` | 200 | 404 |
| | **`POST /api/meetings/{id}/transcript`** (upload + analysis) | 201 | 400, 404, 422 |
| | `GET /api/meetings/{id}/alerts` | 200 | 404 |
| | `GET /api/meetings/{id}/summary` (4.5) | 200 | 404 |
| | `GET /api/meetings/{id}/churn-risk` (4.4) | 200 | 404 |
| Transcript lines | `GET /api/transcript-lines` · `GET /{id}` · `POST` · `PUT /{id}` · `DELETE /{id}` | 200 · 200 · 201 · 200 · 204 | 400, 404, 422 |
| Dictionary terms | `GET /api/dictionary-terms` · `GET /{id}` · `POST` · `PUT /{id}` · `DELETE /{id}` | 200 · 200 · 201 · 200 · 204 | 400, 404, 422 |
| Alerts | `GET /api/alerts` · `GET /{id}` · `POST` · `PUT /{id}` · `DELETE /{id}` | 200 · 200 · 201 · 200 · 204 | 400, 404, 422 |
| | `GET /api/alerts/pending` (US04 queue) | 200 | — |
| | `POST /api/alerts/{id}/validate` (4.2) | 200 | 400, 404, 422 |

Every endpoint can also return **401** when called without login (Phase 4).

**Commit:** `feat(api): rest controllers, request dtos and global exception handler`

---

## Phase 4 — Swagger, Security and CORS (copy the class setup)

1. **`config/OpenApiConfig`** — same as class: `@OpenAPIDefinition` with
   title "Nous Sight API", version "1.0", a one-line description of the
   product, `security = @SecurityRequirement(name = "basicAuth")`, and
   `@SecurityScheme(name = "basicAuth", type = HTTP, scheme = "basic")`.
2. **Controllers:** `@Tag(name, description)` on each controller and
   `@Operation(summary = "...")` on each endpoint, in English. For the
   business-rule endpoints, add a `description` stating the rule (e.g.
   validate: "Only PENDING alerts can be reviewed"). Nothing else is needed.
3. **`config/SecurityConfig`** — same as class: `BCryptPasswordEncoder`,
   `InMemoryUserDetailsManager` with two users (`aluno`/`123456` role USER,
   `admin`/`admin123` roles USER+ADMIN), `csrf` disabled, `cors` enabled,
   `OPTIONS /**`, `/swagger-ui/**`, `/swagger-ui.html`, `/v3/api-docs/**`
   and `/h2-console/**` permitted, everything else authenticated, `httpBasic`,
   `frameOptions(sameOrigin)` for the H2 console.
4. **`config/CorsConfig`** — same as class: mapping `/api/**`, origins
   `http://localhost:5500` and `http://127.0.0.1:5500`, methods
   GET/POST/PUT/DELETE/OPTIONS.
5. **Manual check:** open `http://localhost:8080/swagger-ui.html`, click
   *Authorize* (`aluno` / `123456`) and run the MVP flow:
   `POST /api/meetings/9/transcript` → `GET /api/alerts/pending` →
   `POST /api/alerts/{id}/validate` → `GET /api/meetings/9/summary` and
   `/churn-risk` (should be High). Take screenshots for the PDF.
6. `NousSightApplicationTests.contextLoads` must still pass with Security on.

**Commit:** `feat(config): swagger, basic auth security and cors`

---

## Phase 5 — Documentation for the delivery

1. **`README.md`** (English): what Nous Sight does, architecture
   (packages), how to run (H2 default with sample data; Oracle profile after
   running `sprint4.sql`), Swagger URL + login, business-rule table
   (rule → class/method), team members and RMs:
   Áurea Sardinha – RM 563837; Bernardo Yuji Rodriguez Hanashiro – RM 565266;
   Marco Aurélio – RM 563827; Matheus Vasques – RM 563309;
   Thomas Sievers – RM 563566.
2. **`Docs/ENDPOINTS.md`**: the Phase 3 table (URI, verb, status codes)
   ready to paste into the PDF.
3. **`Docs/CLASS_DIAGRAM.md`**: updated class diagram in Mermaid
   (`classDiagram`) with entities, enums, services and controllers, for the
   PDF.
4. **`Docs/SPEC.md`**: update to Sprint 4 (database facts from section 1,
   new rules, new endpoints).
5. **`Docs/insomnia_collection.json`**: update the URLs to `/api/...` and
   add Basic Auth, or delete it (Swagger replaces it) — ask the user.

**Commit:** `docs: sprint 4 readme, endpoint table and class diagram`

---

## Definition of Done

- [ ] `./mvnw test` passes; `./mvnw spring-boot:run` starts on H2 with the `sprint4.sql` sample data.
- [ ] Entities match the DDL (sequences, composite key, sizes) — the app works with the Oracle profile on the delivered schema.
- [ ] Full CRUD for the 7 tables + transcript analysis, validation queue, summary and churn risk, all under `/api`.
- [ ] Errors return 400 / 404 / 422 through `ApiExceptionHandler`; no `try/catch` in controllers.
- [ ] Swagger UI lists every endpoint with `@Tag` + `@Operation`; login works with `aluno`/`123456`.
- [ ] Everything in English except table/column names and stored values.
- [ ] README, `ENDPOINTS.md`, `CLASS_DIAGRAM.md` and Swagger screenshots ready for the PDF.

## Questions to ask the user (do not guess)

1. Oracle username/password for `application-oracle.properties`, or keep `RM`/`Senha`?
2. Insomnia collection: update it or delete it?
