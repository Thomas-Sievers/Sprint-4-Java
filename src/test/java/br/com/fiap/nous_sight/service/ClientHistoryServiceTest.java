package br.com.fiap.nous_sight.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.fiap.nous_sight.domain.TermCategory;
import br.com.fiap.nous_sight.dto.MeetingSummaryDTO;
import br.com.fiap.nous_sight.entity.DictionaryTerm;
import br.com.fiap.nous_sight.entity.GeneratedAlert;
import br.com.fiap.nous_sight.entity.Meeting;
import br.com.fiap.nous_sight.entity.TranscriptLine;
import br.com.fiap.nous_sight.repository.GeneratedAlertRepository;
import br.com.fiap.nous_sight.repository.TranscriptLineRepository;

@ExtendWith(MockitoExtension.class)
class ClientHistoryServiceTest {

    @Mock
    private GeneratedAlertRepository alertRepository;

    @Mock
    private TranscriptLineRepository transcriptLineRepository;

    @Mock
    private AlertService alertService;

    private ClientHistoryService service;

    @BeforeEach
    void setUp() {
        service = new ClientHistoryService(alertRepository, transcriptLineRepository, alertService);
    }

    private GeneratedAlert rivalAlertSpokenAt(LocalDateTime spokenAt) {
        TranscriptLine line = TranscriptLine.builder().spokenAt(spokenAt).build();
        DictionaryTerm term = DictionaryTerm.builder().category(TermCategory.COMPETITOR).build();
        return GeneratedAlert.builder().transcriptLine(line).term(term).build();
    }

    @Test
    void calculateChurnRisk_returnsLowForOneOrFewerMentions() {
        Meeting meeting = Meeting.builder().id(1L).build();
        List<GeneratedAlert> alerts = List.of(rivalAlertSpokenAt(LocalDateTime.now()));
        when(alertRepository.findByTerm_CategoryAndTranscriptLine_Meeting(TermCategory.COMPETITOR, meeting)).thenReturn(alerts);

        assertEquals("Low", service.calculateChurnRisk(meeting));
    }

    @Test
    void calculateChurnRisk_returnsMediumForTwoOrThreeMentions() {
        Meeting meeting = Meeting.builder().id(1L).build();
        List<GeneratedAlert> alerts = List.of(
                rivalAlertSpokenAt(LocalDateTime.now()),
                rivalAlertSpokenAt(LocalDateTime.now()),
                rivalAlertSpokenAt(LocalDateTime.now()));
        when(alertRepository.findByTerm_CategoryAndTranscriptLine_Meeting(TermCategory.COMPETITOR, meeting)).thenReturn(alerts);

        assertEquals("Medium", service.calculateChurnRisk(meeting));
    }

    @Test
    void calculateChurnRisk_returnsHighForFourOrMoreMentions() {
        Meeting meeting = Meeting.builder().id(1L).build();
        List<GeneratedAlert> alerts = List.of(
                rivalAlertSpokenAt(LocalDateTime.now()),
                rivalAlertSpokenAt(LocalDateTime.now()),
                rivalAlertSpokenAt(LocalDateTime.now()),
                rivalAlertSpokenAt(LocalDateTime.now()));
        when(alertRepository.findByTerm_CategoryAndTranscriptLine_Meeting(TermCategory.COMPETITOR, meeting)).thenReturn(alerts);

        assertEquals("High", service.calculateChurnRisk(meeting));
    }

    @Test
    void calculateChurnRisk_ignoresMentionsOlderThan30Days() {
        Meeting meeting = Meeting.builder().id(1L).build();
        List<GeneratedAlert> alerts = List.of(
                rivalAlertSpokenAt(LocalDateTime.now().minusDays(45)),
                rivalAlertSpokenAt(LocalDateTime.now().minusDays(45)),
                rivalAlertSpokenAt(LocalDateTime.now().minusDays(45)));
        when(alertRepository.findByTerm_CategoryAndTranscriptLine_Meeting(TermCategory.COMPETITOR, meeting)).thenReturn(alerts);

        assertEquals("Low", service.calculateChurnRisk(meeting));
    }

    @Test
    void generateMeetingSummary_aggregatesTranscriptLinesAlertsAndTermsByCategory() {
        Long meetingId = 1L;

        TranscriptLine line1 = TranscriptLine.builder().spokenAt(LocalDateTime.now()).build();
        TranscriptLine line2 = TranscriptLine.builder().spokenAt(LocalDateTime.now()).build();
        when(transcriptLineRepository.findByMeeting_Id(meetingId)).thenReturn(List.of(line1, line2));

        DictionaryTerm rivalTerm = DictionaryTerm.builder().keyword("Concorrente X").category(TermCategory.COMPETITOR).build();
        DictionaryTerm techTerm = DictionaryTerm.builder().keyword("Cloud").category(TermCategory.TECHNOLOGY).build();
        List<GeneratedAlert> alerts = List.of(
                GeneratedAlert.builder().transcriptLine(line1).term(rivalTerm).confidenceScore(90).build(),
                GeneratedAlert.builder().transcriptLine(line2).term(techTerm).confidenceScore(70).build());
        when(alertRepository.findByTranscriptLine_Meeting_Id(meetingId)).thenReturn(alerts);
        when(alertService.calculateAverageConfidenceScore(meetingId)).thenReturn(80.0);

        MeetingSummaryDTO summary = service.generateMeetingSummary(meetingId);

        assertEquals(2, summary.getTotalTranscriptLines());
        assertEquals(2, summary.getTotalAlerts());
        assertEquals(80.0, summary.getAverageConfidenceScore());
        assertEquals(List.of("Concorrente X"), summary.getTermsByCategory().get(TermCategory.COMPETITOR));
        assertEquals(List.of("Cloud"), summary.getTermsByCategory().get(TermCategory.TECHNOLOGY));
    }
}
