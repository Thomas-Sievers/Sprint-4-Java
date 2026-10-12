package br.com.fiap.nous_sight.dto;

import java.util.List;

import br.com.fiap.nous_sight.entity.GeneratedAlert;
import br.com.fiap.nous_sight.entity.TranscriptLine;

public record TranscriptAnalysisResult(
        List<TranscriptLine> transcriptLines,
        List<GeneratedAlert> alerts,
        long pendingAlerts,
        double averageConfidenceScore,
        String churnRisk) {
}
