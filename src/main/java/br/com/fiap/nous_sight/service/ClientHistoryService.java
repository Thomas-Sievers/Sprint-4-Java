package br.com.fiap.nous_sight.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import br.com.fiap.nous_sight.domain.TermCategory;
import br.com.fiap.nous_sight.dto.MeetingSummaryDTO;
import br.com.fiap.nous_sight.entity.GeneratedAlert;
import br.com.fiap.nous_sight.entity.Meeting;
import br.com.fiap.nous_sight.entity.TranscriptLine;
import br.com.fiap.nous_sight.repository.GeneratedAlertRepository;
import br.com.fiap.nous_sight.repository.TranscriptLineRepository;

@Service
public class ClientHistoryService {

    private static final int CHURN_RISK_WINDOW_DAYS = 30;

    private final GeneratedAlertRepository alertRepository;
    private final TranscriptLineRepository transcriptLineRepository;
    private final AlertService alertService;

    public ClientHistoryService(GeneratedAlertRepository alertRepository,
                                 TranscriptLineRepository transcriptLineRepository,
                                 AlertService alertService) {
        this.alertRepository = alertRepository;
        this.transcriptLineRepository = transcriptLineRepository;
        this.alertService = alertService;
    }

    public String calculateChurnRisk(Meeting meeting) {
        LocalDateTime windowStart = LocalDateTime.now().minusDays(CHURN_RISK_WINDOW_DAYS);

        long rivalMentionCount = alertRepository
                .findByTerm_CategoryAndTranscriptLine_Meeting(TermCategory.COMPETITOR, meeting)
                .stream()
                .filter(alert -> alert.getTranscriptLine().getSpokenAt().isAfter(windowStart))
                .count();

        if (rivalMentionCount <= 1) {
            return "Low";
        }
        if (rivalMentionCount <= 3) {
            return "Medium";
        }
        return "High";
    }

    public MeetingSummaryDTO generateMeetingSummary(Long meetingId) {
        List<TranscriptLine> transcriptLines = transcriptLineRepository.findByMeeting_Id(meetingId);
        List<GeneratedAlert> alerts = alertRepository.findByTranscriptLine_Meeting_Id(meetingId);

        Map<TermCategory, List<String>> termsByCategory = alerts.stream()
                .collect(Collectors.groupingBy(
                        alert -> alert.getTerm().getCategory(),
                        Collectors.mapping(alert -> alert.getTerm().getKeyword(), Collectors.toList())));

        termsByCategory.replaceAll((category, keywords) ->
                keywords.stream().distinct().collect(Collectors.toList()));

        return MeetingSummaryDTO.builder()
                .totalTranscriptLines(transcriptLines.size())
                .totalAlerts(alerts.size())
                .averageConfidenceScore(alertService.calculateAverageConfidenceScore(meetingId))
                .termsByCategory(termsByCategory)
                .build();
    }
}
