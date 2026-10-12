package br.com.fiap.nous_sight.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TranscriptLineRequest(
        @NotNull Long meetingId,
        @NotNull Long participantId,
        @NotNull LocalDateTime spokenAt,
        @NotBlank @Size(max = 4000) String text) {
}
