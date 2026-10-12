package br.com.fiap.nous_sight.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.fiap.nous_sight.domain.TermCategory;
import br.com.fiap.nous_sight.dto.MeetingSummaryDTO;
import br.com.fiap.nous_sight.entity.GeneratedAlert;
import br.com.fiap.nous_sight.entity.TranscriptLine;
import br.com.fiap.nous_sight.repository.GeneratedAlertRepository;
import br.com.fiap.nous_sight.repository.TranscriptLineRepository;

@Service
public class ClientHistoryService {

    private final GeneratedAlertRepository alertRepository;
    private final TranscriptLineRepository transcriptLineRepository;
    private final AlertService alertService;
    private final MeetingService meetingService;

    public ClientHistoryService(GeneratedAlertRepository alertRepository,
                                TranscriptLineRepository transcriptLineRepository,
                                AlertService alertService,
                                MeetingService meetingService) {
        this.alertRepository = alertRepository;
        this.transcriptLineRepository = transcriptLineRepository;
        this.alertService = alertService;
        this.meetingService = meetingService;
    }

    // 4.4 - competitor mentions in the meeting: 0-1 Low, 2-3 Medium, 4+ High (computed, not stored)
    @Transactional(readOnly = true)
    public String calculateChurnRisk(Long meetingId) {
        meetingService.findById(meetingId);
        long competitorMentions = alertRepository
                .countByTranscriptLine_Meeting_IdAndTerm_Category(meetingId, TermCategory.COMPETITOR);

        if (competitorMentions <= 1) {
            return "Low";
        }
        if (competitorMentions <= 3) {
            return "Medium";
        }
        return "High";
    }

    // 4.5 - lines, alerts, average score and detected terms of a meeting
    @Transactional(readOnly = true)
    public MeetingSummaryDTO generateMeetingSummary(Long meetingId) {
        meetingService.findById(meetingId);
        List<TranscriptLine> transcriptLines = transcriptLineRepository.findByMeeting_IdOrderBySpokenAt(meetingId);
        List<GeneratedAlert> alerts = alertRepository.findByTranscriptLine_Meeting_Id(meetingId);

        Map<TermCategory, List<String>> termsByCategory = alerts.stream()
                .collect(Collectors.groupingBy(
                        alert -> alert.getTerm().getCategory(),
                        Collectors.mapping(alert -> alert.getTerm().getKeyword(),
                                Collectors.collectingAndThen(Collectors.toList(),
                                        keywords -> keywords.stream().distinct().toList()))));

        return new MeetingSummaryDTO(
                transcriptLines.size(),
                alerts.size(),
                alertService.calculateAverageConfidenceScore(meetingId),
                termsByCategory);
    }
}
