package br.com.fiap.nous_sight.domain;

/**
 * Role of a participant in a meeting.
 * Stored in REUNIAO_PARTICIPANTE.TIPO_PARTICIPACAO through {@link ParticipationTypeConverter}.
 */
public enum ParticipationType {
    ORGANIZER,
    PRESENTER,
    LISTENER
}
