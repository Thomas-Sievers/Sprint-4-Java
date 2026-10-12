package br.com.fiap.nous_sight.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "FALA_TRANSCRICAO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode
public class TranscriptLine {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seqFalaTranscricao")
    @SequenceGenerator(name = "seqFalaTranscricao", sequenceName = "SEQ_FALA_TRANSCRICAO", allocationSize = 1)
    @Column(name = "ID_TRANSCRICAO")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ID_REUNIAO", nullable = false)
    private Meeting meeting;

    @ManyToOne
    @JoinColumn(name = "ID_PARTICIPANTE", nullable = false)
    private Participant participant;

    @Column(name = "HORA_FALA", nullable = false)
    private LocalDateTime spokenAt;

    @Column(name = "TEXTO_FALA", nullable = false, length = 4000)
    private String text;
}
