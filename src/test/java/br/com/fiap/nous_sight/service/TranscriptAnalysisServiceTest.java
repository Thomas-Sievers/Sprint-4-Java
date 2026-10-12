package br.com.fiap.nous_sight.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.fiap.nous_sight.domain.TermCategory;
import br.com.fiap.nous_sight.domain.ValidationStatus;
import br.com.fiap.nous_sight.dto.TranscriptAnalysisResult;
import br.com.fiap.nous_sight.dto.TranscriptLineRequest;
import br.com.fiap.nous_sight.dto.TranscriptRequest;
import br.com.fiap.nous_sight.entity.DictionaryTerm;
import br.com.fiap.nous_sight.entity.GeneratedAlert;
import br.com.fiap.nous_sight.entity.Meeting;
import br.com.fiap.nous_sight.entity.TranscriptLine;
import br.com.fiap.nous_sight.exception.ResourceNotFoundException;
import br.com.fiap.nous_sight.repository.GeneratedAlertRepository;

@ExtendWith(MockitoExtension.class)
class TranscriptAnalysisServiceTest {

    private static final Long MEETING_ID = 9L;
    private static final LocalDateTime SPOKEN_AT = LocalDateTime.of(2026, 9, 11, 10, 30);

    private static final DictionaryTerm SAP = DictionaryTerm.builder()
            .id(1L).keyword("SAP").category(TermCategory.COMPETITOR).build();
    private static final DictionaryTerm SALESFORCE = DictionaryTerm.builder()
            .id(6L).keyword("Salesforce").category(TermCategory.COMPETITOR).build();
    private static final DictionaryTerm AI = DictionaryTerm.builder()
            .id(10L).keyword("Inteligencia Artificial").category(TermCategory.TECHNOLOGY).build();

    @Mock
    private MeetingService meetingService;

    @Mock
    private TranscriptLineService transcriptLineService;

    @Mock
    private DictionaryTermService dictionaryTermService;

    @Mock
    private ClientHistoryService clientHistoryService;

    @Mock
    private GeneratedAlertRepository alertRepository;

    private TranscriptAnalysisService service;

    // Lines "saved" by the mocked TranscriptLineService, by id
    private final Map<Long, TranscriptLine> savedLines = new HashMap<>();

    @BeforeEach
    void setUp() {
        // Real AlertService so the status is derived from the score exactly as in production
        AlertService alertService = new AlertService(alertRepository, transcriptLineService, dictionaryTermService, meetingService);
        service = new TranscriptAnalysisService(meetingService, transcriptLineService, dictionaryTermService,
                alertService, clientHistoryService);
    }

    private void mockMeetingAndTerms() {
        when(meetingService.findById(MEETING_ID)).thenReturn(Meeting.builder().id(MEETING_ID).build());
        when(dictionaryTermService.findAll()).thenReturn(List.of(SAP, SALESFORCE, AI));
        when(transcriptLineService.create(any(TranscriptLineRequest.class))).thenAnswer(invocation -> {
            TranscriptLineRequest request = invocation.getArgument(0);
            long id = savedLines.size() + 100L;
            TranscriptLine line = TranscriptLine.builder().id(id).spokenAt(request.spokenAt()).text(request.text()).build();
            savedLines.put(id, line);
            return line;
        });
        when(clientHistoryService.calculateChurnRisk(MEETING_ID)).thenReturn("High");
    }

    private void mockAlertCreation() {
        when(transcriptLineService.findById(any())).thenAnswer(invocation -> savedLines.get(invocation.<Long>getArgument(0)));
        when(dictionaryTermService.findById(any())).thenAnswer(invocation -> {
            Long id = invocation.getArgument(0);
            return List.of(SAP, SALESFORCE, AI).stream().filter(term -> term.getId().equals(id)).findFirst().orElseThrow();
        });
        when(alertRepository.save(any(GeneratedAlert.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    private TranscriptRequest transcript(String... texts) {
        return new TranscriptRequest(List.of(texts).stream()
                .map(text -> new TranscriptRequest.Line(1L, SPOKEN_AT, text))
                .toList());
    }

    @Test
    void analyze_detectsKeywordAsWholeWordIgnoringCase() {
        mockMeetingAndTerms();
        mockAlertCreation();

        TranscriptAnalysisResult result = service.analyze(MEETING_ID, transcript("O cliente recebeu uma proposta da sap."));

        assertEquals(1, result.alerts().size());
        assertEquals(SAP, result.alerts().get(0).getTerm());
    }

    @Test
    void analyze_doesNotMatchKeywordInsideAnotherWord() {
        mockMeetingAndTerms();

        TranscriptAnalysisResult result = service.analyze(MEETING_ID, transcript("Ele comprou um sapato novo."));

        assertTrue(result.alerts().isEmpty());
        verify(alertRepository, never()).save(any());
    }

    @Test
    void analyze_ignoresAccents() {
        mockMeetingAndTerms();
        mockAlertCreation();

        TranscriptAnalysisResult result = service.analyze(MEETING_ID,
                transcript("A inteligência artificial vai resumir a reunião."));

        assertEquals(1, result.alerts().size());
        assertEquals(AI, result.alerts().get(0).getTerm());
    }

    @Test
    void analyze_shortKeywordGetsScore70AndPending() {
        mockMeetingAndTerms();
        mockAlertCreation();

        GeneratedAlert alert = service.analyze(MEETING_ID, transcript("A SAP ofereceu desconto.")).alerts().get(0);

        assertEquals(70, alert.getConfidenceScore());
        assertEquals(ValidationStatus.PENDING, alert.getValidationStatus());
    }

    @Test
    void analyze_longKeywordGetsScore95AndValidated() {
        mockMeetingAndTerms();
        mockAlertCreation();

        GeneratedAlert alert = service.analyze(MEETING_ID, transcript("Eles avaliam o Salesforce.")).alerts().get(0);

        assertEquals(95, alert.getConfidenceScore());
        assertEquals(ValidationStatus.VALIDATED, alert.getValidationStatus());
    }

    @Test
    void analyze_returnsLinesPendingCountAverageAndChurnRisk() {
        mockMeetingAndTerms();
        mockAlertCreation();

        TranscriptAnalysisResult result = service.analyze(MEETING_ID, transcript(
                "A SAP e o Salesforce estao na disputa.",
                "Nada relevante nesta fala."));

        assertEquals(2, result.transcriptLines().size());
        assertEquals(2, result.alerts().size());
        assertEquals(1, result.pendingAlerts());
        assertEquals(82.5, result.averageConfidenceScore());
        assertEquals("High", result.churnRisk());
    }

    @Test
    void analyze_usesLineTextCutTo200CharsAsNote() {
        mockMeetingAndTerms();
        mockAlertCreation();
        String longText = "Salesforce " + "x".repeat(300);

        GeneratedAlert alert = service.analyze(MEETING_ID, transcript(longText)).alerts().get(0);

        assertEquals(longText.substring(0, 200), alert.getNote());
    }

    @Test
    void analyze_throwsWhenMeetingNotFoundAndSavesNothing() {
        when(meetingService.findById(MEETING_ID)).thenThrow(new ResourceNotFoundException("Meeting not found: 9"));

        assertThrows(ResourceNotFoundException.class, () -> service.analyze(MEETING_ID, transcript("A SAP ligou.")));
        verify(transcriptLineService, never()).create(any());
        verify(alertRepository, never()).save(any());
    }
}
