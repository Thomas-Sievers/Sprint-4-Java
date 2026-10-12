# Nous Sight API — Endpoints

Base URL: `http://localhost:8080`. Every endpoint below needs HTTP Basic login
(`aluno` / `123456`) and returns **401 Unauthorized** without it. Request and
response bodies are JSON.

**Status codes used**

| Code | Meaning |
|---|---|
| 200 OK | Read or update succeeded |
| 201 Created | Record created |
| 204 No Content | Record deleted |
| 400 Bad Request | Invalid request fields or malformed JSON |
| 401 Unauthorized | Missing or wrong login |
| 404 Not Found | The record, or a record referenced by id, does not exist |
| 422 Unprocessable Entity | A business rule was violated |

## Departments

| Verb | URI | Description | Success | Errors |
|---|---|---|---|---|
| GET | `/api/departments` | List all departments | 200 | 401 |
| GET | `/api/departments/{id}` | Find a department by id | 200 | 401, 404 |
| POST | `/api/departments` | Create a department (unique acronym) | 201 | 400, 401, 422 |
| PUT | `/api/departments/{id}` | Update a department | 200 | 400, 401, 404, 422 |
| DELETE | `/api/departments/{id}` | Delete a department (only if it has no participants) | 204 | 401, 404, 422 |

Body: `{"departmentName": "Juridico", "acronym": "JUR"}`

## Participants

| Verb | URI | Description | Success | Errors |
|---|---|---|---|---|
| GET | `/api/participants` | List all participants | 200 | 401 |
| GET | `/api/participants/{id}` | Find a participant by id | 200 | 401, 404 |
| POST | `/api/participants` | Create a participant (unique email, existing department) | 201 | 400, 401, 404, 422 |
| PUT | `/api/participants/{id}` | Update a participant | 200 | 400, 401, 404, 422 |
| DELETE | `/api/participants/{id}` | Delete a participant (only if not in meetings and no transcript lines) | 204 | 401, 404, 422 |

Body: `{"name": "Ana Souza", "email": "ana@empresa.com", "departmentId": 1}`

## Meetings

| Verb | URI | Description | Success | Errors |
|---|---|---|---|---|
| GET | `/api/meetings` | List all meetings | 200 | 401 |
| GET | `/api/meetings/{id}` | Find a meeting by id | 200 | 401, 404 |
| POST | `/api/meetings` | Create a meeting (end ≥ start) | 201 | 400, 401, 422 |
| PUT | `/api/meetings/{id}` | Update a meeting | 200 | 400, 401, 404, 422 |
| DELETE | `/api/meetings/{id}` | Delete a meeting (only if no participants and no transcript lines) | 204 | 401, 404, 422 |
| GET | `/api/meetings/{id}/participants` | List the participants of a meeting | 200 | 401, 404 |
| POST | `/api/meetings/{id}/participants` | Link a participant (no duplicates, one ORGANIZER) | 201 | 400, 401, 404, 422 |
| DELETE | `/api/meetings/{id}/participants/{participantId}` | Unlink a participant | 204 | 401, 404 |
| GET | `/api/meetings/{id}/transcript-lines` | List the transcript lines of a meeting | 200 | 401, 404 |
| POST | `/api/meetings/{id}/transcript` | **Upload and analyze a transcript** | 201 | 400, 401, 404, 422 |
| GET | `/api/meetings/{id}/alerts` | List the alerts of a meeting | 200 | 401, 404 |
| GET | `/api/meetings/{id}/summary` | Meeting summary (rule 4.5) | 200 | 401, 404 |
| GET | `/api/meetings/{id}/churn-risk` | Churn risk of the meeting (rule 4.4) | 200 | 401, 404 |

Bodies:
- Meeting: `{"title": "Kickoff", "startDateTime": "2026-10-01T10:00:00", "endDateTime": "2026-10-01T11:00:00"}`
- Link: `{"participantId": 2, "participationType": "LISTENER"}` (`ORGANIZER` | `PRESENTER` | `LISTENER`)
- Transcript: `{"lines": [{"participantId": 1, "spokenAt": "2026-09-11T10:55:00", "text": "..."}]}`
  → returns `transcriptLines`, `alerts`, `pendingAlerts`, `averageConfidenceScore`, `churnRisk`
- Churn risk response: `{"meetingId": 9, "churnRisk": "High"}` (`Low` | `Medium` | `High`)

## Transcript lines

| Verb | URI | Description | Success | Errors |
|---|---|---|---|---|
| GET | `/api/transcript-lines` | List all transcript lines | 200 | 401 |
| GET | `/api/transcript-lines/{id}` | Find a transcript line by id | 200 | 401, 404 |
| POST | `/api/transcript-lines` | Create a line (speaker in the meeting, time within the meeting) | 201 | 400, 401, 404, 422 |
| PUT | `/api/transcript-lines/{id}` | Update a line | 200 | 400, 401, 404, 422 |
| DELETE | `/api/transcript-lines/{id}` | Delete a line (only if it has no alerts) | 204 | 401, 404, 422 |

Body: `{"meetingId": 1, "participantId": 1, "spokenAt": "2026-09-01T09:30:00", "text": "..."}`

## Dictionary terms

| Verb | URI | Description | Success | Errors |
|---|---|---|---|---|
| GET | `/api/dictionary-terms` | List all terms | 200 | 401 |
| GET | `/api/dictionary-terms/{id}` | Find a term by id | 200 | 401, 404 |
| POST | `/api/dictionary-terms` | Create a term (unique keyword) | 201 | 400, 401, 422 |
| PUT | `/api/dictionary-terms/{id}` | Update a term | 200 | 400, 401, 404, 422 |
| DELETE | `/api/dictionary-terms/{id}` | Delete a term (only if it has no alerts) | 204 | 401, 404, 422 |

Body: `{"keyword": "Senior", "category": "COMPETITOR"}` (`COMPETITOR` | `OWN_PRODUCT` | `TECHNOLOGY`)

## Alerts

| Verb | URI | Description | Success | Errors |
|---|---|---|---|---|
| GET | `/api/alerts` | List all alerts | 200 | 401 |
| GET | `/api/alerts/pending` | Human validation queue (status `PENDING`) | 200 | 401 |
| GET | `/api/alerts/{id}` | Find an alert by id | 200 | 401, 404 |
| POST | `/api/alerts` | Create an alert (status derived from the score; one per line + term) | 201 | 400, 401, 404, 422 |
| PUT | `/api/alerts/{id}` | Update an alert (status is not changed) | 200 | 400, 401, 404, 422 |
| DELETE | `/api/alerts/{id}` | Delete an alert | 204 | 401, 404 |
| POST | `/api/alerts/{id}/validate` | Register the human validation (rule 4.2, only `PENDING` alerts) | 200 | 400, 401, 404, 422 |

Bodies:
- Alert: `{"transcriptLineId": 2, "termId": 7, "note": "...", "confidenceScore": 60}` (0–100)
- Validation: `{"confirmed": true}` or `{"confirmed": false, "correctedNote": "..."}`

## Public (no login)

| Verb | URI | Description | Success |
|---|---|---|---|
| GET | `/swagger-ui.html` | Swagger UI | 200 |
| GET | `/v3/api-docs` | OpenAPI document | 200 |
| GET | `/h2-console` | H2 console (default profile only) | 200 |
