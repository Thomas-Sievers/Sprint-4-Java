package br.com.fiap.nous_sight.dto;

import br.com.fiap.nous_sight.domain.TermCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DictionaryTermRequest(
        @NotBlank @Size(max = 50) String keyword,
        @NotNull TermCategory category) {
}
