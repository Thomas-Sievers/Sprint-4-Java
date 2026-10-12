package br.com.fiap.nous_sight.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DepartmentRequest(
        @NotBlank @Size(max = 50) String departmentName,
        @NotBlank @Size(max = 10) String acronym) {
}
