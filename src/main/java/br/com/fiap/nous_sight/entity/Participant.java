package br.com.fiap.nous_sight.entity;

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
@Table(name = "PARTICIPANTE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seqParticipante")
    @SequenceGenerator(name = "seqParticipante", sequenceName = "SEQ_PARTICIPANTE", allocationSize = 1)
    @Column(name = "ID_PARTICIPANTE")
    private Long id;

    @Column(name = "NOME", nullable = false, length = 100)
    private String name;

    @Column(name = "EMAIL", nullable = false, unique = true, length = 100)
    private String email;

    @ManyToOne
    @JoinColumn(name = "ID_DEPARTAMENTO")
    private Department department;
}
