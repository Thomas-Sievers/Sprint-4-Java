package br.com.fiap.nous_sight.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MeetingRequest(
        @NotBlank @Size(max = 100) String title,
        @NotNull LocalDateTime startDateTime,
        LocalDateTime endDateTime) {
}
