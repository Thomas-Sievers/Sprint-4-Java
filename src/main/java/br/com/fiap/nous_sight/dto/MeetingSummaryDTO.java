package br.com.fiap.nous_sight.dto;

import java.util.List;
import java.util.Map;

import br.com.fiap.nous_sight.domain.TermCategory;

public record MeetingSummaryDTO(
        long totalTranscriptLines,
        long totalAlerts,
        double averageConfidenceScore,
        Map<TermCategory, List<String>> termsByCategory) {
}
