package br.com.fiap.nous_sight.dto;

import br.com.fiap.nous_sight.domain.ParticipationType;
import jakarta.validation.constraints.NotNull;

public record MeetingParticipantRequest(
        @NotNull Long participantId,
        @NotNull ParticipationType participationType) {
}
