package br.com.fiap.nous_sight.dto;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Transcript upload: the lines of a meeting, analyzed together.
 */
public record TranscriptRequest(@NotEmpty List<@Valid Line> lines) {

    public record Line(
            @NotNull Long participantId,
            @NotNull LocalDateTime spokenAt,
            @NotBlank @Size(max = 4000) String text) {
    }
}
