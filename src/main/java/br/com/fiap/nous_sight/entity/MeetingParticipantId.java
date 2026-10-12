package br.com.fiap.nous_sight.entity;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Composite primary key of REUNIAO_PARTICIPANTE (ID_REUNIAO, ID_PARTICIPANTE).
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class MeetingParticipantId implements Serializable {

    @Column(name = "ID_REUNIAO")
    private Long meetingId;

    @Column(name = "ID_PARTICIPANTE")
    private Long participantId;
}
