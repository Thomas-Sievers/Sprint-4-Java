package br.com.fiap.nous_sight.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Maps {@link TermCategory} to the Portuguese values stored by sprint4.sql.
 */
@Converter
public class TermCategoryConverter implements AttributeConverter<TermCategory, String> {

    @Override
    public String convertToDatabaseColumn(TermCategory category) {
        if (category == null) {
            return null;
        }
        return switch (category) {
            case COMPETITOR -> "Time Rival";
            case OWN_PRODUCT -> "Produto Próprio";
            case TECHNOLOGY -> "Tecnologia";
        };
    }

    @Override
    public TermCategory convertToEntityAttribute(String value) {
        if (value == null) {
            return null;
        }
        return switch (value) {
            case "Time Rival" -> TermCategory.COMPETITOR;
            case "Produto Próprio" -> TermCategory.OWN_PRODUCT;
            case "Tecnologia" -> TermCategory.TECHNOLOGY;
            default -> throw new IllegalArgumentException("Unknown term category: " + value);
        };
    }
}
