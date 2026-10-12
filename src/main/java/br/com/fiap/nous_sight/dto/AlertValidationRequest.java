package br.com.fiap.nous_sight.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AlertValidationRequest(
        @NotNull Boolean confirmed,
        @Size(max = 200) String correctedNote) {
}
