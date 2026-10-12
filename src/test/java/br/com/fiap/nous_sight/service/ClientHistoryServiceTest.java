package br.com.fiap.nous_sight.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
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
import br.com.fiap.nous_sight.exception.ResourceNotFoundException;
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

    @Mock
    private MeetingService meetingService;

    private ClientHistoryService service;

    @BeforeEach
    void setUp() {
        service = new ClientHistoryService(alertRepository, transcriptLineRepository, alertService, meetingService);
    }

    private void mockCompetitorMentions(long count) {
        when(meetingService.findById(1L)).thenReturn(Meeting.builder().id(1L).build());
        when(alertRepository.countByTranscriptLine_Meeting_IdAndTerm_Category(1L, TermCategory.COMPETITOR))
                .thenReturn(count);
    }

    @Test
    void calculateChurnRisk_returnsLowForOneOrFewerMentions() {
        mockCompetitorMentions(1);
        assertEquals("Low", service.calculateChurnRisk(1L));
    }

    @Test
    void calculateChurnRisk_returnsMediumForTwoOrThreeMentions() {
        mockCompetitorMentions(3);
        assertEquals("Medium", service.calculateChurnRisk(1L));
    }

    @Test
    void calculateChurnRisk_returnsHighForFourOrMoreMentions() {
        mockCompetitorMentions(4);
        assertEquals("High", service.calculateChurnRisk(1L));
    }

    @Test
    void calculateChurnRisk_throwsWhenMeetingNotFound() {
        when(meetingService.findById(99L)).thenThrow(new ResourceNotFoundException("Meeting not found: 99"));

        assertThrows(ResourceNotFoundException.class, () -> service.calculateChurnRisk(99L));
    }

    @Test
    void generateMeetingSummary_aggregatesTranscriptLinesAlertsAndTermsByCategory() {
        Long meetingId = 1L;
        when(meetingService.findById(meetingId)).thenReturn(Meeting.builder().id(meetingId).build());

        TranscriptLine line1 = TranscriptLine.builder().spokenAt(LocalDateTime.now()).build();
        TranscriptLine line2 = TranscriptLine.builder().spokenAt(LocalDateTime.now()).build();
        when(transcriptLineRepository.findByMeeting_IdOrderBySpokenAt(meetingId)).thenReturn(List.of(line1, line2));

        DictionaryTerm competitorTerm = DictionaryTerm.builder().keyword("Concorrente X").category(TermCategory.COMPETITOR).build();
        DictionaryTerm techTerm = DictionaryTerm.builder().keyword("Cloud").category(TermCategory.TECHNOLOGY).build();
        List<GeneratedAlert> alerts = List.of(
                GeneratedAlert.builder().transcriptLine(line1).term(competitorTerm).confidenceScore(90).build(),
                GeneratedAlert.builder().transcriptLine(line2).term(competitorTerm).confidenceScore(90).build(),
                GeneratedAlert.builder().transcriptLine(line2).term(techTerm).confidenceScore(60).build());
        when(alertRepository.findByTranscriptLine_Meeting_Id(meetingId)).thenReturn(alerts);
        when(alertService.calculateAverageConfidenceScore(meetingId)).thenReturn(80.0);

        MeetingSummaryDTO summary = service.generateMeetingSummary(meetingId);

        assertEquals(2, summary.totalTranscriptLines());
        assertEquals(3, summary.totalAlerts());
        assertEquals(80.0, summary.averageConfidenceScore());
        assertEquals(List.of("Concorrente X"), summary.termsByCategory().get(TermCategory.COMPETITOR));
        assertEquals(List.of("Cloud"), summary.termsByCategory().get(TermCategory.TECHNOLOGY));
    }

    @Test
    void generateMeetingSummary_throwsWhenMeetingNotFound() {
        when(meetingService.findById(99L)).thenThrow(new ResourceNotFoundException("Meeting not found: 99"));

        assertThrows(ResourceNotFoundException.class, () -> service.generateMeetingSummary(99L));
    }
}
