package br.com.fiap.nous_sight.dto;

import java.util.List;
import java.util.Map;

import br.com.fiap.nous_sight.domain.TermCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode
public class MeetingSummaryDTO {

    private long totalTranscriptLines;
    private long totalAlerts;
    private double averageConfidenceScore;
    private Map<TermCategory, List<String>> termsByCategory;
}
