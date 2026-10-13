// Shapes returned and accepted by the Nous Sight API (Sprint 4).
// Controllers return the JPA entities, so related records come nested.
// Dates are ISO LocalDateTime strings without time zone ("2026-09-11T10:20:00").

export type Tema = "claro" | "escuro";

export type ValidationStatus = "PENDING" | "VALIDATED" | "CORRECTED";
export type TermCategory = "COMPETITOR" | "OWN_PRODUCT" | "TECHNOLOGY";
export type ParticipationType = "ORGANIZER" | "PRESENTER" | "LISTENER";
export type ChurnRiskLevel = "Low" | "Medium" | "High";

export interface Department {
  id: number;
  departmentName: string;
  acronym: string;
}

export interface Participant {
  id: number;
  name: string;
  email: string;
  department: Department | null;
}

export interface Meeting {
  id: number;
  title: string;
  startDateTime: string;
  endDateTime: string | null;
}

export interface MeetingParticipant {
  id: { meetingId: number; participantId: number };
  meeting: Meeting;
  participant: Participant;
  participationType: ParticipationType;
}

export interface DictionaryTerm {
  id: number;
  keyword: string;
  category: TermCategory;
}

export interface TranscriptLine {
  id: number;
  meeting: Meeting;
  participant: Participant;
  spokenAt: string;
  text: string;
}

export interface GeneratedAlert {
  id: number;
  transcriptLine: TranscriptLine;
  term: DictionaryTerm;
  note: string | null;
  confidenceScore: number;
  validationStatus: ValidationStatus;
}

export interface MeetingSummary {
  totalTranscriptLines: number;
  totalAlerts: number;
  averageConfidenceScore: number;
  termsByCategory: Partial<Record<TermCategory, string[]>>;
}

export interface TranscriptAnalysisResult {
  transcriptLines: TranscriptLine[];
  alerts: GeneratedAlert[];
  pendingAlerts: number;
  averageConfidenceScore: number;
  churnRisk: ChurnRiskLevel;
}

export interface ChurnRisk {
  meetingId: number;
  churnRisk: ChurnRiskLevel;
}

// Requests

export interface DepartmentRequest {
  departmentName: string;
  acronym: string;
}

export interface ParticipantRequest {
  name: string;
  email: string;
  departmentId: number;
}

export interface MeetingRequest {
  title: string;
  startDateTime: string;
  endDateTime?: string | null;
}

export interface MeetingParticipantRequest {
  participantId: number;
  participationType: ParticipationType;
}

export interface DictionaryTermRequest {
  keyword: string;
  category: TermCategory;
}

export interface TranscriptRequest {
  lines: { participantId: number; spokenAt: string; text: string }[];
}

export interface AlertValidationRequest {
  confirmed: boolean;
  correctedNote?: string;
}

// Error body from ApiExceptionHandler: `message` on 404/422, `fields` on 400.
export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  fields?: Record<string, string>;
}
