package br.com.fiap.nous_sight.service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.fiap.nous_sight.domain.ValidationStatus;
import br.com.fiap.nous_sight.dto.AlertRequest;
import br.com.fiap.nous_sight.dto.TranscriptAnalysisResult;
import br.com.fiap.nous_sight.dto.TranscriptLineRequest;
import br.com.fiap.nous_sight.dto.TranscriptRequest;
import br.com.fiap.nous_sight.entity.DictionaryTerm;
import br.com.fiap.nous_sight.entity.GeneratedAlert;
import br.com.fiap.nous_sight.entity.TranscriptLine;

/**
 * MVP transcript analysis (US01/US02/US03): saves the uploaded lines, detects dictionary
 * terms in each one and raises an alert per (line, term) with a confidence score.
 */
@Service
public class TranscriptAnalysisService {

    private static final int HIGH_CONFIDENCE_SCORE = 95;
    // Short keywords (SAP, CRM, ERP) are ambiguous acronyms -> score below 80 -> human validation
    private static final int SHORT_KEYWORD_SCORE = 70;
    private static final int SHORT_KEYWORD_MAX_LENGTH = 3;
    private static final int NOTE_MAX_LENGTH = 200;

    private final MeetingService meetingService;
    private final TranscriptLineService transcriptLineService;
    private final DictionaryTermService dictionaryTermService;
    private final AlertService alertService;
    private final ClientHistoryService clientHistoryService;

    public TranscriptAnalysisService(MeetingService meetingService,
                                     TranscriptLineService transcriptLineService,
                                     DictionaryTermService dictionaryTermService,
                                     AlertService alertService,
                                     ClientHistoryService clientHistoryService) {
        this.meetingService = meetingService;
        this.transcriptLineService = transcriptLineService;
        this.dictionaryTermService = dictionaryTermService;
        this.alertService = alertService;
        this.clientHistoryService = clientHistoryService;
    }

    // One transaction: if any line is invalid, nothing is saved
    @Transactional
    public TranscriptAnalysisResult analyze(Long meetingId, TranscriptRequest request) {
        meetingService.findById(meetingId);
        List<DictionaryTerm> terms = dictionaryTermService.findAll();

        List<TranscriptLine> lines = new ArrayList<>();
        List<GeneratedAlert> alerts = new ArrayList<>();

        for (TranscriptRequest.Line item : request.lines()) {
            TranscriptLine line = transcriptLineService.create(
                    new TranscriptLineRequest(meetingId, item.participantId(), item.spokenAt(), item.text()));
            lines.add(line);

            for (DictionaryTerm term : terms) {
                if (mentions(line.getText(), term.getKeyword())) {
                    alerts.add(alertService.create(new AlertRequest(
                            line.getId(), term.getId(), evidence(line.getText()), scoreFor(term))));
                }
            }
        }

        long pendingAlerts = alerts.stream()
                .filter(alert -> alert.getValidationStatus() == ValidationStatus.PENDING)
                .count();
        double averageScore = alerts.stream()
                .mapToInt(GeneratedAlert::getConfidenceScore)
                .average()
                .orElse(0);

        return new TranscriptAnalysisResult(lines, alerts, pendingAlerts, averageScore,
                clientHistoryService.calculateChurnRisk(meetingId));
    }

    // Whole-word match, ignoring case and accents: "SAP" matches "a SAP", not "sapato"
    private boolean mentions(String text, String keyword) {
        Pattern pattern = Pattern.compile("\\b" + Pattern.quote(normalize(keyword)) + "\\b");
        return pattern.matcher(normalize(text)).find();
    }

    private String normalize(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);
    }

    private int scoreFor(DictionaryTerm term) {
        return term.getKeyword().length() <= SHORT_KEYWORD_MAX_LENGTH ? SHORT_KEYWORD_SCORE : HIGH_CONFIDENCE_SCORE;
    }

    // The line itself is the textual evidence of the alert
    private String evidence(String text) {
        return text.length() <= NOTE_MAX_LENGTH ? text : text.substring(0, NOTE_MAX_LENGTH);
    }
}
