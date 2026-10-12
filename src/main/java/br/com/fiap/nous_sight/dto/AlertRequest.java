package br.com.fiap.nous_sight.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * No status field: the validation status is derived from the confidence score.
 */
public record AlertRequest(
        @NotNull Long transcriptLineId,
        @NotNull Long termId,
        @Size(max = 200) String note,
        @NotNull @Min(0) @Max(100) Integer confidenceScore) {
}
