package br.com.fiap.nous_sight.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Maps {@link ValidationStatus} to the Portuguese values stored by sprint4.sql.
 */
@Converter
public class ValidationStatusConverter implements AttributeConverter<ValidationStatus, String> {

    @Override
    public String convertToDatabaseColumn(ValidationStatus status) {
        if (status == null) {
            return null;
        }
        return switch (status) {
            case PENDING -> "Pendente";
            case VALIDATED -> "Validado";
            case CORRECTED -> "Corrigido";
        };
    }

    @Override
    public ValidationStatus convertToEntityAttribute(String value) {
        if (value == null) {
            return null;
        }
        return switch (value) {
            case "Pendente" -> ValidationStatus.PENDING;
            case "Validado" -> ValidationStatus.VALIDATED;
            case "Corrigido" -> ValidationStatus.CORRECTED;
            default -> throw new IllegalArgumentException("Unknown validation status: " + value);
        };
    }
}
