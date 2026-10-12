package br.com.fiap.nous_sight.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
@Table(name = "REUNIAO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seqReuniao")
    @SequenceGenerator(name = "seqReuniao", sequenceName = "SEQ_REUNIAO", allocationSize = 1)
    @Column(name = "ID_REUNIAO")
    private Long id;

    @Column(name = "TITULO", nullable = false, length = 100)
    private String title;

    @Column(name = "DATA_HORA_INICIO", nullable = false)
    private LocalDateTime startDateTime;

    @Column(name = "DATA_HORA_FIM")
    private LocalDateTime endDateTime; // optional; if present, must be >= startDateTime
}
