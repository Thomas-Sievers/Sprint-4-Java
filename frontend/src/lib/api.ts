import type {
  AlertValidationRequest,
  ApiErrorBody,
  ChurnRisk,
  Department,
  DepartmentRequest,
  DictionaryTerm,
  DictionaryTermRequest,
  GeneratedAlert,
  Meeting,
  MeetingParticipant,
  MeetingParticipantRequest,
  MeetingRequest,
  MeetingSummary,
  Participant,
  ParticipantRequest,
  TranscriptAnalysisResult,
  TranscriptLine,
  TranscriptRequest,
} from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!API_BASE_URL) {
  throw new Error(
    "VITE_API_BASE_URL nao configurada. Defina-a em um arquivo .env (veja .env.example).",
  );
}

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

// Session token (base64 of "username:password"), set by AuthContext.
let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

/** Called when a request with the saved token gets 401 (password changed, API restarted...). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export function encodeBasicToken(username: string, password: string): string {
  // btoa only takes Latin-1; encode as UTF-8 first so accented passwords work.
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  return btoa(String.fromCharCode(...bytes));
}

function errorMessage(status: number, body: ApiErrorBody | null): string {
  if (body?.message) return body.message;
  if (body?.fields) {
    return Object.entries(body.fields)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join("; ");
  }
  if (status === 401) return "Sessao expirada. Entre novamente.";
  return `Erro inesperado (${status}).`;
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token = authToken ?? undefined, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      // Makes Spring Security answer 401 without "WWW-Authenticate", so the
      // browser does not open its own Basic login dialog.
      "X-Requested-With": "XMLHttpRequest",
      ...(token ? { Authorization: `Basic ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      // empty or non-JSON body (e.g. 401)
    }
    if (response.status === 401 && options.token === undefined) {
      onUnauthorized?.();
    }
    throw new ApiError(response.status, errorMessage(response.status, body), body?.fields);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function json(method: string, payload: unknown): RequestInit {
  return { method, body: JSON.stringify(payload) };
}

// Login: there is no login endpoint, so any authenticated GET checks the credentials.

export function checkCredentials(token: string): Promise<Meeting[]> {
  return request<Meeting[]>("/api/meetings", { token });
}

// Meetings

export function listMeetings(): Promise<Meeting[]> {
  return request<Meeting[]>("/api/meetings");
}

export function getMeeting(id: number): Promise<Meeting> {
  return request<Meeting>(`/api/meetings/${id}`);
}

export function createMeeting(payload: MeetingRequest): Promise<Meeting> {
  return request<Meeting>("/api/meetings", json("POST", payload));
}

export function listMeetingParticipants(id: number): Promise<MeetingParticipant[]> {
  return request<MeetingParticipant[]>(`/api/meetings/${id}/participants`);
}

export function addMeetingParticipant(
  id: number,
  payload: MeetingParticipantRequest,
): Promise<MeetingParticipant> {
  return request<MeetingParticipant>(`/api/meetings/${id}/participants`, json("POST", payload));
}

export function listMeetingTranscriptLines(id: number): Promise<TranscriptLine[]> {
  return request<TranscriptLine[]>(`/api/meetings/${id}/transcript-lines`);
}

export function analyzeTranscript(
  id: number,
  payload: TranscriptRequest,
): Promise<TranscriptAnalysisResult> {
  return request<TranscriptAnalysisResult>(`/api/meetings/${id}/transcript`, json("POST", payload));
}

export function listMeetingAlerts(id: number): Promise<GeneratedAlert[]> {
  return request<GeneratedAlert[]>(`/api/meetings/${id}/alerts`);
}

export function getMeetingSummary(id: number): Promise<MeetingSummary> {
  return request<MeetingSummary>(`/api/meetings/${id}/summary`);
}

export function getChurnRisk(id: number): Promise<ChurnRisk> {
  return request<ChurnRisk>(`/api/meetings/${id}/churn-risk`);
}

// Alerts

export function listAlerts(): Promise<GeneratedAlert[]> {
  return request<GeneratedAlert[]>("/api/alerts");
}

export function listPendingAlerts(): Promise<GeneratedAlert[]> {
  return request<GeneratedAlert[]>("/api/alerts/pending");
}

export function validateAlert(id: number, payload: AlertValidationRequest): Promise<GeneratedAlert> {
  return request<GeneratedAlert>(`/api/alerts/${id}/validate`, json("POST", payload));
}

// Departments

export function listDepartments(): Promise<Department[]> {
  return request<Department[]>("/api/departments");
}

export function createDepartment(payload: DepartmentRequest): Promise<Department> {
  return request<Department>("/api/departments", json("POST", payload));
}

export function updateDepartment(id: number, payload: DepartmentRequest): Promise<Department> {
  return request<Department>(`/api/departments/${id}`, json("PUT", payload));
}

export function deleteDepartment(id: number): Promise<void> {
  return request<void>(`/api/departments/${id}`, { method: "DELETE" });
}

// Participants

export function listParticipants(): Promise<Participant[]> {
  return request<Participant[]>("/api/participants");
}

export function createParticipant(payload: ParticipantRequest): Promise<Participant> {
  return request<Participant>("/api/participants", json("POST", payload));
}

export function updateParticipant(id: number, payload: ParticipantRequest): Promise<Participant> {
  return request<Participant>(`/api/participants/${id}`, json("PUT", payload));
}

export function deleteParticipant(id: number): Promise<void> {
  return request<void>(`/api/participants/${id}`, { method: "DELETE" });
}

// Dictionary terms

export function listDictionaryTerms(): Promise<DictionaryTerm[]> {
  return request<DictionaryTerm[]>("/api/dictionary-terms");
}

export function createDictionaryTerm(payload: DictionaryTermRequest): Promise<DictionaryTerm> {
  return request<DictionaryTerm>("/api/dictionary-terms", json("POST", payload));
}

export function updateDictionaryTerm(
  id: number,
  payload: DictionaryTermRequest,
): Promise<DictionaryTerm> {
  return request<DictionaryTerm>(`/api/dictionary-terms/${id}`, json("PUT", payload));
}

export function deleteDictionaryTerm(id: number): Promise<void> {
  return request<void>(`/api/dictionary-terms/${id}`, { method: "DELETE" });
}
