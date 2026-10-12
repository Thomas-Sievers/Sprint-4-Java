package br.com.fiap.nous_sight.entity;

import br.com.fiap.nous_sight.domain.ParticipationType;
import br.com.fiap.nous_sight.domain.ParticipationTypeConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "REUNIAO_PARTICIPANTE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode
public class MeetingParticipant {

    @EmbeddedId
    private MeetingParticipantId id;

    @ManyToOne
    @MapsId("meetingId")
    @JoinColumn(name = "ID_REUNIAO")
    private Meeting meeting;

    @ManyToOne
    @MapsId("participantId")
    @JoinColumn(name = "ID_PARTICIPANTE")
    private Participant participant;

    @Convert(converter = ParticipationTypeConverter.class)
    @Column(name = "TIPO_PARTICIPACAO", nullable = false, length = 20)
    private ParticipationType participationType;
}
