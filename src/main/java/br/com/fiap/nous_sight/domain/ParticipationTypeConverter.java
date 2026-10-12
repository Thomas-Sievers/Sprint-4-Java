package br.com.fiap.nous_sight.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Maps {@link ParticipationType} to the Portuguese values stored by sprint4.sql.
 */
@Converter
public class ParticipationTypeConverter implements AttributeConverter<ParticipationType, String> {

    @Override
    public String convertToDatabaseColumn(ParticipationType type) {
        if (type == null) {
            return null;
        }
        return switch (type) {
            case ORGANIZER -> "Organizador";
            case PRESENTER -> "Apresentador";
            case LISTENER -> "Ouvinte";
        };
    }

    @Override
    public ParticipationType convertToEntityAttribute(String value) {
        if (value == null) {
            return null;
        }
        return switch (value) {
            case "Organizador" -> ParticipationType.ORGANIZER;
            case "Apresentador" -> ParticipationType.PRESENTER;
            case "Ouvinte" -> ParticipationType.LISTENER;
            default -> throw new IllegalArgumentException("Unknown participation type: " + value);
        };
    }
}
