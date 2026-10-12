# Nous Sight — Project Instructions
 
Conversational Intelligence platform for TOTVS. Turns sales-meeting
transcripts into structured insights (confidence score + human validation
for anything below 80%, churn-risk tracking per client).
 
## Full spec
 
@Docs/SPEC.md
 
The file above is the source of truth for entities, business rules,
repository/service/controller contracts, connection config, and tests.
Read it before generating or editing any code in this project.

## Sprint 4 plan

@Docs/SPRINT4_IMPLEMENTATION_PLAN.md

The Sprint 4 plan above takes precedence over SPEC.md wherever they differ
(sequence IDs, composite key, enums + converters, `/api` routes, global
exception handler instead of `try/catch`). The database schema and sample
data come from `Docs/sql/sprint4.sql`.
 
## Stack
 
Spring Boot + Spring Data JPA + Lombok. Package pattern:
`entity → repository → service → controller`. Tests: JUnit 5 + Mockito.
 
## Non-negotiable rule
 
Physical DB table/column names and stored domain values (e.g. `'Pendente'`,
`'Validado'`, `'Time Rival'`) stay in **Portuguese** — they already exist in
the real Oracle schema. Java identifiers (classes, fields, methods) stay in
**English**. Every `@Column`/`@JoinColumn` must use an explicit
`name = "..."` pointing at the Portuguese physical name. Never let Hibernate
guess the column name from the English field name.
 
## Commands
 
- `./mvnw spring-boot:run` — run locally against H2 (default profile)
- `./mvnw spring-boot:run -Dspring-boot.run.profiles=oracle` — run against Oracle
- `./mvnw test` — run the test suite

Use `./mvnw`, not Homebrew's `mvn`: Homebrew's Maven runs on JDK 26, where
Mockito cannot mock classes. The wrapper uses the system JDK 21.

## Working style
 
Build one layer at a time (entity → repository → service → controller →
config/tests), following the phases in Docs/SPRINT4_IMPLEMENTATION_PLAN.md. Show the result
after each layer before moving to the next.